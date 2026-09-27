// Ticket 01: generates the same test Expressions with several OpenRouter TTS models and voices, plus a 0.75×
// Slow version of each, and records what each Clip actually cost. Output: voice-test/ (gitignored).
//
//   node --env-file=.env scripts/voice-test.ts
//
// Reads OPENROUTER_KEY (or OPENROUTER_API_KEY) from the environment. Re-running skips Clips that already exist.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expressionById } from '../src/catalog/index.ts'

const KEY = process.env.OPENROUTER_KEY ?? process.env.OPENROUTER_API_KEY
if (!KEY) throw new Error('Set OPENROUTER_KEY in .env')

const OUT = new URL('../voice-test/', import.meta.url).pathname
const PHRASES = ['hello', 'thank-you', 'bathroom-where', 'iced-americano', 'i-dont-understand']

interface VoiceSpec {
  id: string
  /** Display name when the id is opaque. */
  name?: string
  gender: 'female' | 'male' | 'unknown'
}
interface ModelSpec {
  model: string
  label: string
  /** Gemini only returns raw 24 kHz 16-bit mono PCM. */
  format: 'mp3' | 'pcm'
  voices: VoiceSpec[]
  note?: string
}

export const MODELS: ModelSpec[] = [
  { model: 'google/gemini-3.8-flash-tts', label: 'Gemini 3.8 Flash TTS', format: 'pcm', voices: [{ id: 'Kore', gender: 'female' }, { id: 'Puck', gender: 'male' }] },
  { model: 'google/gemini-3.8-flash-lite-tts', label: 'Gemini 3.8 Flash Lite TTS', format: 'pcm', voices: [{ id: 'Kore', gender: 'female' }, { id: 'Puck', gender: 'male' }] },
  { model: 'minimax/speech-2.8-hd', label: 'MiniMax Speech 2.8 HD', format: 'mp3', voices: [{ id: 'Korean_CalmLady', gender: 'female' }, { id: 'Korean_CalmGentleman', gender: 'male' }], note: 'Native Korean voice presets.' },
  { model: 'minimax/speech-2.8-turbo', label: 'MiniMax Speech 2.8 Turbo', format: 'mp3', voices: [{ id: 'Korean_CalmLady', gender: 'female' }, { id: 'Korean_CalmGentleman', gender: 'male' }], note: 'Native Korean voice presets.' },
  { model: 'microsoft/mai-voice-2', label: 'MAI-Voice-2 (multilingual voices)', format: 'mp3', voices: [{ id: 'en-US-Harper:MAI-Voice-2', gender: 'female' }, { id: 'en-US-Jasper:MAI-Voice-2', gender: 'male' }] },
  { model: 'microsoft/mai-voice-2', label: 'MAI-Voice-2 (Azure Korean voices)', format: 'mp3', voices: [{ id: 'ko-KR-SunHiNeural', gender: 'female' }, { id: 'ko-KR-InJoonNeural', gender: 'male' }], note: 'Azure native Korean neural voices, served through the MAI-Voice-2 endpoint.' },
  { model: 'fish-audio/s2.1-pro', label: 'Fish Audio S2.1 Pro', format: 'mp3', voices: [{ id: '87e2073002bf449fb8f7ea46129b72c6', name: 'Korean accent', gender: 'female' }, { id: 'd9aa241e55fd4a27a8d5bc3569c37fb0', name: 'Calm Korean male', gender: 'male' }], note: 'Community Korean voices from the fish.audio library ("Korean accent", "Calm Korean male").' },
  { model: 'qwen/qwen-audio-3.0-tts-plus', label: 'Qwen Audio 3.0 TTS Plus', format: 'mp3', voices: [{ id: 'longanlingxin', gender: 'female' }, { id: 'longanlufeng', gender: 'male' }], note: 'Only longanlingxin is documented as Korean-capable; longanlufeng is listed for Chinese and English.' },
  { model: 'bytedance-seed/seed-audio-1-0', label: 'Seed Audio 1.0', format: 'mp3', voices: [{ id: '', name: 'Default voice', gender: 'unknown' }], note: 'No public voice ids; this is the provider default voice.' },
  { model: 'x-ai/grok-voice-tts-1.0', label: 'Grok Voice TTS 1.0', format: 'mp3', voices: [{ id: 'Ara', gender: 'female' }, { id: 'Rex', gender: 'male' }] },
]

interface ClipResult {
  model: string
  label: string
  voice: string
  voiceName: string
  note?: string
  gender: VoiceSpec['gender']
  phrase: string
  chars: number
  file?: string
  slowFile?: string
  generationId?: string
  latencyMs?: number
  costUsd?: number
  durationSec?: number
  error?: string
}

const slug = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
const resultsPath = join(OUT, 'results.json')
const previous: ClipResult[] = existsSync(resultsPath) ? JSON.parse(readFileSync(resultsPath, 'utf8')) : []
const keyOf = (r: Pick<ClipResult, 'label' | 'voice' | 'phrase'>) => `${r.label}|${r.voice}|${r.phrase}`
const done = new Map(previous.filter((r) => r.file).map((r) => [keyOf(r), r]))

async function synthesize(spec: ModelSpec, voice: VoiceSpec, phraseId: string): Promise<ClipResult> {
  const expression = expressionById.get(phraseId)!
  const base: ClipResult = { model: spec.model, label: spec.label, voice: voice.id, voiceName: voice.name ?? voice.id, note: spec.note, gender: voice.gender, phrase: phraseId, chars: expression.hangul.length }
  const cached = done.get(keyOf(base))
  if (cached && existsSync(join(OUT, cached.file!))) return { ...cached, ...base, file: cached.file, slowFile: cached.slowFile, generationId: cached.generationId, costUsd: cached.costUsd, latencyMs: cached.latencyMs, durationSec: cached.durationSec ?? duration(join(OUT, cached.file!)) }

  const voiceDir = slug(voice.id) || 'default'
  const dir = join(OUT, slug(spec.label), voiceDir)
  mkdirSync(dir, { recursive: true })
  const started = Date.now()
  const res = await fetch('https://openrouter.ai/api/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: spec.model, input: expression.hangul, ...(voice.id ? { voice: voice.id } : {}), response_format: spec.format }),
  })
  const latencyMs = Date.now() - started
  if (!res.ok) return { ...base, latencyMs, error: `${res.status} ${(await res.text()).slice(0, 200)}` }

  const bytes = Buffer.from(await res.arrayBuffer())
  const file = join(slug(spec.label), voiceDir, `${phraseId}.mp3`)
  const slowFile = join(slug(spec.label), voiceDir, `${phraseId}.slow.mp3`)
  const raw = join(dir, `${phraseId}.${spec.format === 'pcm' ? 'pcm' : 'src.mp3'}`)
  writeFileSync(raw, bytes)
  const input = spec.format === 'pcm' ? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', raw] : ['-i', raw]
  // Same encoding for every model so file quality doesn't bias the comparison.
  ffmpeg([...input, '-ac', '1', '-ar', '24000', '-b:a', '64k', join(OUT, file)])
  ffmpeg(['-i', join(OUT, file), '-filter:a', 'atempo=0.75', '-b:a', '64k', join(OUT, slowFile)])
  return { ...base, file, slowFile, latencyMs, durationSec: duration(join(OUT, file)), generationId: res.headers.get('x-generation-id') ?? undefined }
}

function duration(path: string): number {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8' })
  return Math.round(Number(out.trim()) * 100) / 100
}

function ffmpeg(args: string[]) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args])
}

async function fetchCost(generationId: string): Promise<number | undefined> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${generationId}`, { headers: { Authorization: `Bearer ${KEY}` } })
    if (res.ok) {
      const { data } = (await res.json()) as { data: { total_cost?: number } }
      if (typeof data.total_cost === 'number') return data.total_cost
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
  }
  return undefined
}

const results: ClipResult[] = []
for (const spec of MODELS) {
  for (const voice of spec.voices) {
    const clips = await Promise.all(PHRASES.map((p) => synthesize(spec, voice, p)))
    const failed = clips.filter((c) => c.error)
    console.log(`${spec.label} / ${voice.name ?? voice.id}: ${clips.length - failed.length}/${clips.length} ok${failed.length ? ` — ${failed[0].error}` : ''}`)
    results.push(...clips)
  }
}

for (const r of results) {
  if (r.generationId && r.costUsd === undefined) r.costUsd = await fetchCost(r.generationId)
}
writeFileSync(resultsPath, JSON.stringify(results, null, 2))
console.log(`Wrote ${resultsPath}`)
