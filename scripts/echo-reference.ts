// Works out every Expression's reference points for each Echo model (ADR 0004): the raw score of its own Normal
// Clips (100%) and the median raw score of the other Normal Clips in its Topic (0%). Runs the same model and scorer
// the app uses, on the model files fetched into public/ by scripts/echo-models.ts.
//
//   node scripts/echo-reference.ts            recompute the table (a few minutes per model)
//   node scripts/echo-reference.ts --check    verify the table covers every Expression and is fresh; exit 1 if not
//   node scripts/echo-reference.ts --report   also print the Expressions whose own Clips score lowest
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { VOICES } from '../src/audio/voices.ts'
import { catalog, type Expression } from '../src/catalog/index.ts'
import { ECHO_MODELS, modelPath, normaliseAudio, type EchoModel } from '../src/echo/models.ts'
import { SCORER_VERSION, rawScore, toModelOutput, type ModelOutput } from '../src/echo/scorer.ts'
import { expectedSounds } from '../src/echo/sounds.ts'

const ROOT = new URL('..', import.meta.url).pathname
const TABLE = join(ROOT, 'catalog/echo-reference.json')

export type ReferenceTable = Record<string, Record<string, { full: number; zero: number; hash: string }>>

const sha1 = (data: string | Buffer) => createHash('sha1').update(data).digest('hex')
const clipFile = (voice: string, id: string) => join(ROOT, 'public/audio', voice, `${id}.mp3`)

/** Changes when anything a reference point depends on changes: the scorer, the model, or any Clip in the Topic. */
function hashes(model: EchoModel): Map<string, string> {
  const clip = new Map(catalog.map((e) => [e.id, VOICES.map((v) => sha1(readFileSync(clipFile(v, e.id)))).join(',')]))
  const topic = new Map<string, string>()
  for (const e of catalog) topic.set(e.topic, sha1(`${topic.get(e.topic) ?? ''}|${e.id}:${e.romanization}:${clip.get(e.id)}`))
  return new Map(catalog.map((e) => [e.id, sha1(`${SCORER_VERSION}|${model.file.sha256}|${e.romanization}|${topic.get(e.topic)}`).slice(0, 12)]))
}

const table: ReferenceTable = existsSync(TABLE) ? JSON.parse(readFileSync(TABLE, 'utf8')) : {}

if (process.argv.includes('--check')) {
  let stale = 0
  for (const model of ECHO_MODELS) {
    const expected = hashes(model)
    const bad = catalog.filter((e) => table[model.id]?.[e.id]?.hash !== expected.get(e.id))
    console.log(`${model.id}: ${catalog.length - bad.length}/${catalog.length} reference points fresh`)
    for (const e of bad.slice(0, 10)) console.log(`  stale ${e.id}`)
    stale += bad.length
  }
  if (stale) console.log('Run: node scripts/echo-reference.ts')
  process.exit(stale ? 1 : 0)
}

const ort = await import('onnxruntime-node')

function loadClip(path: string, sampleRate: number): Float32Array {
  const buf = execFileSync('ffmpeg', ['-v', 'quiet', '-i', path, '-ac', '1', '-ar', String(sampleRate), '-f', 'f32le', '-'])
  return normaliseAudio(new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4))
}

function greedy({ logProbs, frames, columns }: ModelOutput): string {
  const out: string[] = []
  let prev = -1
  for (let t = 0; t < frames; t++) {
    const row = logProbs.subarray(t * columns.length, (t + 1) * columns.length)
    const best = row.indexOf(Math.max(...row))
    if (best !== prev && best !== 0) out.push(columns[best])
    prev = best
  }
  return out.join(' ')
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const round = (x: number) => Math.round(x * 1000) / 1000

for (const model of ECHO_MODELS) {
  const file = join(ROOT, 'public', modelPath(model))
  if (!existsSync(file)) throw new Error(`${file} is missing. Run: node scripts/echo-models.ts`)
  const session = await ort.InferenceSession.create(file)
  const started = Date.now()

  const outputs = new Map<string, ModelOutput>()
  for (const e of catalog) {
    for (const voice of VOICES) {
      const x = loadClip(clipFile(voice, e.id), model.sampleRate)
      const { logits } = await session.run({ input_values: new ort.Tensor('float32', x, [1, x.length]) })
      outputs.set(`${voice}/${e.id}`, toModelOutput(logits.data as Float32Array, logits.dims[1], model.vocabulary, model.blankTokens))
    }
  }

  const raw = (target: Expression, spoken: string) => {
    const r = rawScore(outputs.get(spoken)!, expectedSounds(target.romanization, model.vocabulary))
    return r.kind === 'heard' ? r.raw : 0
  }
  const hash = hashes(model)
  const entries: ReferenceTable[string] = {}
  for (const e of catalog) {
    const full = VOICES.reduce((sum, v) => sum + raw(e, `${v}/${e.id}`), 0) / VOICES.length
    const peers = catalog.filter((p) => p.topic === e.topic && p.id !== e.id)
    const zero = median(peers.flatMap((p) => VOICES.map((v) => raw(e, `${v}/${p.id}`))))
    entries[e.id] = { full: round(full), zero: round(zero), hash: hash.get(e.id)! }
  }
  table[model.id] = entries
  console.log(`${model.id}: ${catalog.length} Expressions in ${Math.round((Date.now() - started) / 1000)} s`)

  if (process.argv.includes('--report')) {
    const worst = [...catalog].sort((a, b) => entries[a.id].full - entries[b.id].full).slice(0, 25)
    for (const e of worst) {
      const { full, zero } = entries[e.id]
      console.log(`  ${e.id.padEnd(24)} full ${full.toFixed(2)} zero ${zero.toFixed(2)}  ${e.romanization}`)
      const spelled = expectedSounds(e.romanization, model.vocabulary).map((s) => [s.sound, ...s.alternatives].join('/') + (s.optional ? '?' : ''))
      console.log(`      expected ${spelled.join(' ')}`)
      for (const v of VOICES) console.log(`      ${v.padEnd(8)} ${greedy(outputs.get(`${v}/${e.id}`)!)}`)
    }
  }
}

writeFileSync(TABLE, JSON.stringify(table, null, 1) + '\n')
