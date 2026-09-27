// Ticket 03: generates every Clip for the Catalog: a Normal Clip from OpenRouter and a Slow Clip (0.75×, same pitch)
// via ffmpeg, for each Voice. Idempotent: a manifest records a hash per Clip, and only missing or changed ones
// are regenerated.
//
//   node --env-file=.env scripts/audio.ts          generate missing/changed Clips
//   node scripts/audio.ts --check                   verify every Clip exists; exit 1 if not
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { VOICES, type Voice } from '../src/audio/voices.ts'
import { catalog } from '../src/catalog/index.ts'

/** The two Voices picked in the voice test (ticket 01). */
const VOICE_SOURCES: Record<Voice, { model: string; voice: string }> = {
  female: { model: 'minimax/speech-2.8-turbo', voice: 'Korean_CalmLady' },
  male: { model: 'minimax/speech-2.8-turbo', voice: 'Korean_CalmGentleman' },
}
const SLOW_TEMPO = 0.75
const CONCURRENCY = 6

const AUDIO = new URL('../public/audio/', import.meta.url).pathname
const MANIFEST = new URL('../catalog/audio-manifest.json', import.meta.url).pathname
type Manifest = Record<string, string> // "<voice>/<id>" → hash
const manifest: Manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}

const clipHash = (hangul: string, voice: Voice) => {
  const src = VOICE_SOURCES[voice]
  return createHash('sha1').update(`${hangul}|${src.model}|${src.voice}|${SLOW_TEMPO}`).digest('hex').slice(0, 12)
}
const paths = (voice: Voice, id: string) => ({ normal: join(AUDIO, voice, `${id}.mp3`), slow: join(AUDIO, voice, `${id}.slow.mp3`) })
const nonEmpty = (p: string) => existsSync(p) && statSync(p).size > 1000

if (process.argv.includes('--check')) {
  const missing = catalog.flatMap((e) => VOICES.flatMap((v) => Object.values(paths(v, e.id)).filter((p) => !nonEmpty(p))))
  const known = new Set(catalog.map((e) => e.id))
  const orphans = VOICES.flatMap((v) =>
    existsSync(join(AUDIO, v)) ? readdirSync(join(AUDIO, v)).filter((f) => !known.has(f.replace(/(\.slow)?\.mp3$/, ''))) : [],
  )
  console.log(`${catalog.length} Expressions × ${VOICES.length} Voices × 2 speeds: ${missing.length} missing, ${orphans.length} orphaned`)
  for (const m of missing) console.log(`  missing ${m}`)
  for (const o of orphans) console.log(`  orphan ${o}`)
  process.exit(missing.length ? 1 : 0)
}

const KEY = process.env.OPENROUTER_KEY ?? process.env.OPENROUTER_API_KEY
if (!KEY) throw new Error('Set OPENROUTER_KEY in .env')

async function synthesize(voice: Voice, hangul: string): Promise<Buffer> {
  const src = VOICE_SOURCES[voice]
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: src.model, input: hangul, voice: src.voice, response_format: 'mp3' }),
    })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    const detail = `${res.status} ${(await res.text()).slice(0, 160)}`
    if (attempt >= 4) throw new Error(detail)
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
  }
}

function ffmpeg(args: string[]) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args])
}

const jobs = catalog.flatMap((e) => VOICES.map((voice) => ({ e, voice })))
const todo = jobs.filter(({ e, voice }) => {
  const p = paths(voice, e.id)
  return manifest[`${voice}/${e.id}`] !== clipHash(e.hangul, voice) || !nonEmpty(p.normal) || !nonEmpty(p.slow)
})
console.log(`${jobs.length} Clip pairs, ${todo.length} to generate`)

const failures: string[] = []
let done = 0
async function worker() {
  for (let job = todo.shift(); job; job = todo.shift()) {
    const { e, voice } = job
    const p = paths(voice, e.id)
    mkdirSync(join(AUDIO, voice), { recursive: true })
    try {
      const raw = `${p.normal}.src`
      writeFileSync(raw, await synthesize(voice, e.hangul))
      ffmpeg(['-i', raw, '-ac', '1', '-ar', '24000', '-b:a', '48k', p.normal])
      ffmpeg(['-i', p.normal, '-filter:a', `atempo=${SLOW_TEMPO}`, '-ac', '1', '-b:a', '48k', p.slow])
      rmSync(raw)
      manifest[`${voice}/${e.id}`] = clipHash(e.hangul, voice)
    } catch (err) {
      failures.push(`${voice}/${e.id}: ${(err as Error).message}`)
    }
    if (++done % 50 === 0) {
      console.log(`  ${done} done`)
      writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1))
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 1))

const bytes = VOICES.flatMap((v) => (existsSync(join(AUDIO, v)) ? readdirSync(join(AUDIO, v)).map((f) => statSync(join(AUDIO, v, f)).size) : []))
console.log(`Total audio: ${(bytes.reduce((a, b) => a + b, 0) / 1024 / 1024).toFixed(1)} MB in ${bytes.length} files`)
if (failures.length) {
  console.error(`${failures.length} failed:\n${failures.join('\n')}`)
  process.exit(1)
}
