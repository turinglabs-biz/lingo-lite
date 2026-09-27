// The Echo lab (spec stage 1): a separate page where testers try Echo with extra measuring tools. It never touches
// Progress. Removed in stage 2, whichever way the verdict goes.
import { useEffect, useRef, useState } from 'react'
import { VOICES, clipUrl } from '../../audio/voices.ts'
import { expressionById } from '../../catalog/index.ts'
import { ExpressionView } from '../../components/ExpressionView.tsx'
import { PlayButtons } from '../../components/PlayButtons.tsx'
import { EchoButton, EchoScore } from '../EchoButton.tsx'
import { loadModel, unloadModel, type LoadedModel } from '../engine.ts'
import { ECHO_MODELS, echoModelById, type EchoModel, type EchoModelId } from '../models.ts'
import { decode, requestMicrophone } from '../recorder.ts'
import { referencePoints } from '../reference.ts'
import { scoreEcho } from '../scorer.ts'
import { expectedSounds } from '../sounds.ts'
import { bytesToDownload, download, isDownloaded, remove } from '../store.ts'
import { useEcho, type EchoAttempt } from '../useEcho.ts'
import { lab, resultsText, type AttemptKind, type ClipCheckRow, type Fairness, type LabAttempt } from './results.ts'

/** Near-identical pairs, one-syllable numbers, tense and aspirated consonants, a long one, and ordinary ones. */
const TEST_EXPRESSIONS = [
  'hello', 'thank-you', 'sorry', 'excuse-me-attention', 'goodbye-leaving', 'goodbye-staying', 'yes', 'pardon',
  'sino-1', 'sino-2', 'sino-4', 'sino-5', 'beer', 'card-ok', 'its-okay', 'how-much', 'this-one-please', 'bill-please',
  'bathroom-where', 'thanks-for-help',
]

type Setup =
  | { kind: 'checking' }
  | { kind: 'off'; bytes: number; outdated: boolean }
  | { kind: 'downloading'; loaded: number; total: number }
  | { kind: 'needs-mic'; refused: boolean; asking?: boolean }
  | { kind: 'on' }
  | { kind: 'error'; message: string }

type Loaded = { kind: 'none' } | { kind: 'loading' } | { kind: 'ready'; model: LoadedModel } | { kind: 'failed'; message: string }

const mb = (bytes: number) => `${Math.round(bytes / 1e6)} MB`
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`
const message = (err: unknown) => (err instanceof Error ? err.message : String(err))

export function EchoLab({ onClose }: { onClose: () => void }) {
  const [modelId, setModelId] = useState<EchoModelId>(lab.model)
  const model = echoModelById.get(modelId)!
  const [setup, setSetup] = useState<Setup>({ kind: 'checking' })
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'none' })
  const [tester, setTester] = useState(lab.tester)
  const [attempts, setAttempts] = useState(() => lab.attempts().length)
  const ready = loaded.kind === 'ready' ? loaded.model : null

  useEffect(() => () => void unloadModel(), [])

  useEffect(() => {
    let live = true
    setLoaded({ kind: 'none' })
    setSetup({ kind: 'checking' })
    ;(async () => {
      const downloaded = await isDownloaded(model)
      const wasOn = lab.on().includes(model.id)
      if (!live) return
      if (downloaded && wasOn) {
        setSetup({ kind: 'on' })
        load(model, () => live)
      } else {
        if (wasOn) lab.setOn(model.id, false)
        setSetup({ kind: 'off', bytes: await bytesToDownload(model), outdated: wasOn })
      }
    })()
    return () => {
      live = false
    }
  }, [model])

  async function load(m: EchoModel, live = () => true) {
    setLoaded({ kind: 'loading' })
    try {
      const l = await loadModel(m)
      if (live()) setLoaded({ kind: 'ready', model: l })
    } catch (err) {
      if (live()) setLoaded({ kind: 'failed', message: message(err) })
    }
  }

  const lastProgress = useRef(0)
  async function turnOn() {
    try {
      await download(model, (loaded, total) => {
        const now = performance.now()
        if (loaded < total && now - lastProgress.current < 150) return
        lastProgress.current = now
        setSetup({ kind: 'downloading', loaded, total })
      })
      setSetup({ kind: 'needs-mic', refused: false })
    } catch (err) {
      setSetup({ kind: 'error', message: `The download stopped: ${message(err)}. Nothing was kept; try again.` })
    }
  }

  async function allowMic() {
    setSetup({ kind: 'needs-mic', refused: false, asking: true })
    if (!(await requestMicrophone())) return setSetup({ kind: 'needs-mic', refused: true })
    lab.setOn(model.id, true)
    setSetup({ kind: 'on' })
    load(model)
  }

  async function turnOff() {
    await unloadModel()
    setLoaded({ kind: 'none' })
    await remove(model)
    lab.setOn(model.id, false)
    setSetup({ kind: 'off', bytes: await bytesToDownload(model), outdated: false })
  }

  function switchModel(id: EchoModelId) {
    lab.setModel(id)
    setModelId(id)
  }

  return (
    <div className="session lab">
      <div className="session-head">
        <button type="button" className="quit" onClick={onClose} aria-label="Back to Settings">
          ‹
        </button>
        <span className="session-title lab-title">Echo lab</span>
      </div>
      <p className="muted small">
        A test page for Echo. Nothing here changes your Progress. Hold the mic, say the Expression right after its Clip, and
        let go.
      </p>

      <h2>Model</h2>
      <div className="chips" role="radiogroup" aria-label="Model">
        {ECHO_MODELS.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={m.id === modelId} className={`chip ${m.id === modelId ? 'on' : ''}`} onClick={() => switchModel(m.id)}>
            {m.name}
          </button>
        ))}
      </div>
      <p className="muted small">{model.description}</p>
      <SetupRow setup={setup} loaded={loaded} onTurnOn={turnOn} onAllowMic={allowMic} onTurnOff={turnOff} onRetryLoad={() => load(model)} />

      <h2>Tester</h2>
      <input
        className="search"
        placeholder="Your name"
        value={tester}
        onChange={(e) => {
          setTester(e.target.value)
          lab.setTester(e.target.value)
        }}
      />

      <Tools model={ready} tester={tester} attempts={attempts} onCleared={() => setAttempts(0)} />

      <h2>Test Expressions</h2>
      {!ready && <p className="muted small">Turn Echo on above to start echoing.</p>}
      <ul className="list lab-list">
        {TEST_EXPRESSIONS.map((id) => (
          <TestCard key={`${id}-${modelId}`} expressionId={id} model={ready} tester={tester} onAttempt={() => setAttempts((n) => n + 1)} />
        ))}
      </ul>
    </div>
  )
}

function SetupRow({
  setup,
  loaded,
  onTurnOn,
  onAllowMic,
  onTurnOff,
  onRetryLoad,
}: {
  setup: Setup
  loaded: Loaded
  onTurnOn: () => void
  onAllowMic: () => void
  onTurnOff: () => void
  onRetryLoad: () => void
}) {
  switch (setup.kind) {
    case 'checking':
      return <p className="muted small">Checking this phone…</p>
    case 'off':
      return (
        <div className="lab-setup">
          {setup.outdated && <p className="notice">A new model was deployed or the phone cleared it. Download it again to keep using Echo.</p>}
          <button type="button" className="primary-action" onClick={onTurnOn}>
            {setup.bytes > 0 ? `Turn on Echo (${mb(setup.bytes)})` : 'Turn on Echo (already downloaded)'}
          </button>
          <p className="muted small">Downloads once from our server and then works offline.</p>
        </div>
      )
    case 'downloading': {
      const pct = setup.total ? Math.floor((100 * setup.loaded) / setup.total) : 0
      return (
        <div className="lab-setup">
          <div className="session-progress" aria-label="Download progress">
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="muted small">
            Downloading… {mb(setup.loaded)} of {mb(setup.total)} ({pct}%)
          </p>
        </div>
      )
    }
    case 'needs-mic':
      return (
        <div className="lab-setup">
          {setup.refused && <p className="notice">The microphone is blocked. Allow it for this site in Safari's settings, then tap Allow again.</p>}
          <button type="button" className="primary-action" disabled={setup.asking} onClick={onAllowMic}>
            {setup.asking ? 'Waiting for your answer…' : 'Allow the microphone'}
          </button>
          <p className="muted small">Last step. The mic is only on while you hold the button.</p>
        </div>
      )
    case 'error':
      return (
        <div className="lab-setup">
          <p className="notice">{setup.message}</p>
          <button type="button" className="primary-action" onClick={onTurnOn}>
            Try again
          </button>
        </div>
      )
    case 'on':
      return (
        <div className="lab-setup">
          <p className="small">
            {loaded.kind === 'loading' && 'Echo is on. Loading the model…'}
            {loaded.kind === 'ready' && `Echo is on · ${loaded.model.backend === 'webgpu' ? 'WebGPU' : 'WebAssembly'} · loaded in ${seconds(loaded.model.loadMs)}`}
            {loaded.kind === 'failed' && `The model didn't load: ${loaded.message}`}
          </p>
          <div className="lab-buttons">
            {loaded.kind === 'failed' && (
              <button type="button" className="lab-button" onClick={onRetryLoad}>
                Retry
              </button>
            )}
            <button type="button" className="danger" onClick={onTurnOff}>
              Turn off (deletes the model)
            </button>
          </div>
        </div>
      )
  }
}

function Tools({ model, tester, attempts, onCleared }: { model: LoadedModel | null; tester: string; attempts: number; onCleared: () => void }) {
  const [rows, setRows] = useState<ClipCheckRow[]>(lab.clipCheck)
  const [checking, setChecking] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [fallback, setFallback] = useState<string | null>(null)

  async function checkClips() {
    if (!model) return
    setChecking(true)
    const out: ClipCheckRow[] = []
    try {
      for (const id of TEST_EXPRESSIONS) {
        const e = expressionById.get(id)!
        for (const voice of VOICES) {
          const samples = await decode(await (await fetch(clipUrl(id, voice, 'normal'))).arrayBuffer())
          const { output, ms } = await model.run(samples)
          const r = scoreEcho(output, expectedSounds(e.romanization, model.model.vocabulary), referencePoints(model.model.id, id) ?? { full: 1, zero: 0 })
          out.push({ expressionId: id, voice, score: r.kind === 'heard' ? r.score : null, raw: r.kind === 'heard' ? round(r.raw) : null, inferMs: Math.round(ms) })
          setRows([...out])
        }
      }
      lab.setClipCheck(out)
    } finally {
      setChecking(false)
    }
  }

  async function copy() {
    const text = resultsText({ tester, model: model?.model.id ?? lab.model(), backend: model?.backend ?? null, loadMs: model ? Math.round(model.loadMs) : null })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(`Copied ${attempts} attempts`)
      setFallback(null)
    } catch {
      setFallback(text)
    }
  }

  const heard = rows.filter((r) => r.score !== null)
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0)
  return (
    <>
      <h2>Tools</h2>
      <div className="lab-buttons">
        <button type="button" className="lab-button" disabled={!model || checking} onClick={checkClips}>
          {checking ? `Scoring Clips… ${rows.length}/${TEST_EXPRESSIONS.length * VOICES.length}` : "Score the Voices' Clips"}
        </button>
        <button type="button" className="lab-button" onClick={copy}>
          Copy results ({attempts})
        </button>
        <ClearButton
          onCleared={() => {
            setRows([])
            onCleared()
          }}
        />
      </div>
      {copied && <p className="muted small">{copied}</p>}
      {fallback && <textarea className="lab-fallback" readOnly value={fallback} onFocus={(e) => e.currentTarget.select()} />}
      {rows.length > 0 && (
        <details className="lab-clips">
          <summary>
            Voices' Clips: average {avg(heard.map((r) => r.score!))}%, model {avg(rows.map((r) => r.inferMs))} ms per Clip
          </summary>
          <table>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.expressionId}-${r.voice}`}>
                  <td>{r.expressionId}</td>
                  <td>{r.voice}</td>
                  <td>{r.score === null ? '—' : `${r.score}%`}</td>
                  <td className="muted">{r.raw ?? ''}</td>
                  <td className="muted">{r.inferMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </>
  )
}

function ClearButton({ onCleared }: { onCleared: () => void }) {
  const [confirming, setConfirming] = useState(false)
  if (!confirming)
    return (
      <button type="button" className="lab-button" onClick={() => setConfirming(true)}>
        Clear results
      </button>
    )
  return (
    <span className="confirm">
      <button type="button" onClick={() => setConfirming(false)}>
        Cancel
      </button>
      <button
        type="button"
        className="danger"
        onClick={() => {
          lab.clear()
          onCleared()
          setConfirming(false)
        }}
      >
        Delete results
      </button>
    </span>
  )
}

const KINDS: { id: AttemptKind; label: string }[] = [
  { id: 'careful', label: 'Careful' },
  { id: 'mistake', label: 'Deliberate mistake' },
  { id: 'different', label: 'Different Expression' },
]
const FAIRNESS: { id: Fairness; label: string }[] = [
  { id: 'harsh', label: 'Too harsh' },
  { id: 'fair', label: 'Fair' },
  { id: 'generous', label: 'Too generous' },
]
const NOT_HEARD: Record<string, string> = {
  'too-short': 'too short',
  'no-speech': 'no speech heard',
  'too-short-for-sounds': 'too short for all the sounds',
}
const round = (x: number) => Math.round(x * 1000) / 1000

function TestCard({ expressionId, model, tester, onAttempt }: { expressionId: string; model: LoadedModel | null; tester: string; onAttempt: () => void }) {
  const expression = expressionById.get(expressionId)!
  const [kind, setKind] = useState<AttemptKind>('careful')
  const [latest, setLatest] = useState<LabAttempt | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  useEffect(() => () => void (recordingUrl && URL.revokeObjectURL(recordingUrl)), [recordingUrl])

  const echo = useEcho(expressionId, model, (attempt: EchoAttempt) => {
    const r = attempt.result
    const a: LabAttempt = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      tester,
      model: model!.model.id,
      backend: model!.backend,
      expressionId,
      kind,
      score: r.kind === 'heard' ? r.score : null,
      notHeard: r.kind === 'not-heard' ? r.reason : null,
      raw: r.kind === 'heard' ? round(r.raw) : null,
      sounds: r.kind === 'heard' ? r.sounds.map((s) => [s.sound, round(s.rating)]) : [],
      scoreMs: Math.round(attempt.scoreMs),
      inferMs: Math.round(attempt.inferMs),
      seconds: round(attempt.seconds),
      fairness: null,
    }
    lab.addAttempt(a)
    onAttempt()
    setLatest(a)
    setRecordingUrl(attempt.recording ? URL.createObjectURL(attempt.recording) : null)
  })

  function rate(fairness: Fairness) {
    if (!latest) return
    lab.updateAttempt(latest.id, { fairness })
    setLatest({ ...latest, fairness })
  }

  return (
    <li className="lab-card">
      <div className="lab-card-head">
        <ExpressionView expression={expression} size="compact" />
        <PlayButtons expressionId={expressionId} />
      </div>
      <div className="chips lab-kinds" role="radiogroup" aria-label="Attempt">
        {KINDS.map((k) => (
          <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className={`chip ${kind === k.id ? 'on' : ''}`} onClick={() => setKind(k.id)}>
            {k.label}
          </button>
        ))}
      </div>
      <EchoButton state={echo.state} disabled={!model} onBegin={echo.begin} onEnd={echo.end} />
      <EchoScore state={echo.state} />
      {latest && (
        <>
          <p className="muted small lab-meta">
            {latest.raw !== null ? `raw ${latest.raw.toFixed(2)}` : NOT_HEARD[latest.notHeard ?? ''] ?? latest.notHeard} · scored in{' '}
            {seconds(latest.scoreMs)} (model {seconds(latest.inferMs)}) · {latest.seconds.toFixed(1)} s recording
            {recordingUrl && (
              <>
                {' · '}
                <button type="button" className="lab-link" onClick={() => new Audio(recordingUrl).play()}>
                  play my recording
                </button>
              </>
            )}
          </p>
          <div className="chips lab-fairness" role="radiogroup" aria-label="Was the score fair?">
            {FAIRNESS.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={latest.fairness === f.id} className={`chip ${latest.fairness === f.id ? 'on' : ''}`} onClick={() => rate(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
    </li>
  )
}
