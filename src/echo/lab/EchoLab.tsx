// The Echo lab: a test page, opened from Settings, for trying Echo with extra detail (raw scores, each sound's rating,
// timings, recording playback, a Clip check). It has its own Echo switch, shares the downloaded files with Echo in the
// main flow, and never touches Progress.
import { useEffect, useState } from 'react'
import { VOICES, clipUrl } from '../../audio/voices.ts'
import { expressionById } from '../../catalog/index.ts'
import { ExpressionView } from '../../components/ExpressionView.tsx'
import { PlayButtons } from '../../components/PlayButtons.tsx'
import { db } from '../../db.ts'
import { EchoButton, EchoScore } from '../EchoButton.tsx'
import { EchoSetup } from '../EchoSetup.tsx'
import { loadModel, unloadModel, type LoadedModel } from '../engine.ts'
import { ECHO_MODELS, echoModelById, type EchoModel, type EchoModelId } from '../models.ts'
import { decode } from '../recorder.ts'
import { referencePoints } from '../reference.ts'
import { scoreEcho } from '../scorer.ts'
import { expectedSounds } from '../sounds.ts'
import { useEcho, type EchoAttempt } from '../useEcho.ts'
import { useEchoSetup } from '../useEchoSetup.ts'
import { lab, resultsText, type AttemptKind, type ClipCheckRow, type Fairness, type LabAttempt } from './results.ts'

/** Near-identical pairs, one-syllable numbers, tense and aspirated consonants, a long one, and ordinary ones. */
const TEST_EXPRESSIONS = [
  'hello', 'thank-you', 'sorry', 'excuse-me-attention', 'goodbye-leaving', 'goodbye-staying', 'yes', 'pardon',
  'sino-1', 'sino-2', 'sino-4', 'sino-5', 'beer', 'card-ok', 'its-okay', 'how-much', 'this-one-please', 'bill-please',
  'bathroom-where', 'thanks-for-help',
]

type Loaded = { kind: 'none' } | { kind: 'loading' } | { kind: 'ready'; model: LoadedModel } | { kind: 'failed'; message: string }

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`
const message = (err: unknown) => (err instanceof Error ? err.message : String(err))
/** Whether Echo is on in the main flow (Settings), which also needs the downloaded files and the loaded model. */
const echoOnInApp = async () => !!(await db.settings.get('settings'))?.echo

export function EchoLab({ onClose }: { onClose: () => void }) {
  const [modelId, setModelId] = useState<EchoModelId>(lab.model)
  const model = echoModelById.get(modelId) ?? ECHO_MODELS[0]
  const { setup, turnOn, allowMic, turnOff } = useEchoSetup(model, {
    isOn: () => lab.on().includes(model.id),
    setOn: (on) => lab.setOn(model.id, on),
    othersNeedFiles: echoOnInApp,
  })
  const [loaded, setLoaded] = useState<Loaded>({ kind: 'none' })
  const [tester, setTester] = useState(lab.tester)
  const [attempts, setAttempts] = useState(() => lab.attempts().length)
  const ready = loaded.kind === 'ready' ? loaded.model : null

  // Free the model when leaving, unless Echo in the main flow uses it too.
  useEffect(
    () => () => {
      echoOnInApp().then((on) => {
        if (!on) unloadModel()
      })
    },
    [],
  )

  useEffect(() => {
    if (setup.kind !== 'on') return setLoaded({ kind: 'none' })
    let live = true
    load(model, () => live)
    return () => {
      live = false
    }
  }, [setup.kind, model])

  async function load(m: EchoModel, live = () => true) {
    setLoaded({ kind: 'loading' })
    try {
      const l = await loadModel(m)
      if (live()) setLoaded({ kind: 'ready', model: l })
    } catch (err) {
      if (live()) setLoaded({ kind: 'failed', message: message(err) })
    }
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
      {ECHO_MODELS.length > 1 && (
        <div className="chips" role="radiogroup" aria-label="Model">
          {ECHO_MODELS.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={m.id === model.id} className={`chip ${m.id === model.id ? 'on' : ''}`} onClick={() => switchModel(m.id)}>
              {m.name}
            </button>
          ))}
        </div>
      )}
      <p className="muted small">
        {model.name}: {model.description}
      </p>
      <EchoSetup
        setup={setup}
        onTurnOn={turnOn}
        onAllowMic={allowMic}
        onTurnOff={turnOff}
        status={
          <>
            {loaded.kind === 'loading' && 'Echo is on. Loading the model…'}
            {loaded.kind === 'ready' && `Echo is on · ${loaded.model.backend === 'webgpu' ? 'WebGPU' : 'WebAssembly'} · loaded in ${seconds(loaded.model.loadMs)}`}
            {loaded.kind === 'failed' && `The model didn't load: ${loaded.message}`}
          </>
        }
        actions={
          loaded.kind === 'failed' && (
            <button type="button" className="lab-button" onClick={() => load(model)}>
              Retry
            </button>
          )
        }
      />

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
          <TestCard key={`${id}-${model.id}`} expressionId={id} model={ready} tester={tester} onAttempt={() => setAttempts((n) => n + 1)} />
        ))}
      </ul>
    </div>
  )
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
