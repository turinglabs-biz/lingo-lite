// Ticket 01: builds voice-test/index.html, the page for comparing voices and reviewing the Catalog.
// Run after scripts/voice-test.ts:  node scripts/voice-test-page.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { catalog, topics } from '../src/catalog/index.ts'
import { BATCH_SIZE } from '../src/catalog/order.ts'

const OUT = new URL('../voice-test/', import.meta.url)
const results = JSON.parse(readFileSync(new URL('results.json', OUT), 'utf8')) as {
  model: string
  label: string
  voice: string
  voiceName: string
  note?: string
  gender: string
  phrase: string
  chars: number
  file?: string
  slowFile?: string
  latencyMs?: number
  costUsd?: number
  durationSec?: number
  error?: string
}[]

// Live list prices from OpenRouter.
const models = ((await (await fetch('https://openrouter.ai/api/v1/models?output_modalities=speech')).json()) as {
  data: { id: string; pricing: { prompt: string; completion: string } }[]
}).data
const listPrice = (id: string) => {
  const p = models.find((m) => m.id === id)?.pricing
  if (!p) return 'unknown'
  const prompt = Number(p.prompt) * 1e6
  const completion = Number(p.completion) * 1e6
  // Gemini bills tokens (text in, audio out); the others bill input characters.
  if (completion > 0) return `$${prompt.toFixed(2)} / 1M input tokens + $${completion.toFixed(2)} / 1M audio tokens`
  return `$${prompt.toFixed(2)} / 1M characters`
}

const catalogChars = catalog.reduce((sum, e) => sum + e.hangul.length, 0)
const labels = [...new Set(results.map((r) => r.label))]
const modelRows = labels.map((label) => {
  const clips = results.filter((r) => r.label === label)
  const ok = clips.filter((c) => c.file)
  const cost = ok.reduce((s, c) => s + (c.costUsd ?? 0), 0)
  const chars = ok.reduce((s, c) => s + c.chars, 0)
  const latencies = ok.map((c) => c.latencyMs ?? 0).sort((a, b) => a - b)
  return {
    label,
    model: clips[0].model,
    note: clips[0].note,
    listPrice: listPrice(clips[0].model),
    testCost: cost,
    testClips: ok.length,
    costPerChar: chars ? cost / chars : 0,
    projectedPerVoice: chars ? (cost / chars) * catalogChars : 0,
    medianLatencyMs: latencies[Math.floor(latencies.length / 2)] ?? 0,
    failed: clips.length - ok.length,
    error: clips.find((c) => c.error)?.error,
  }
})

const batchOf = new Map(catalog.map((e, i) => [e.id, Math.floor(i / BATCH_SIZE) + 1]))

// Open decisions from the independent Catalog review (catalog/review-flags.md), with Claude's recommendation.
const decisions = [
  { id: 'fix-atm', group: 'Corrections', text: 'atm-where: write ATM in Hangul (에이티엠 어디 있어요?) so the voice reads it correctly.', rec: 'accept' },
  { id: 'cut-counter-four', group: 'Corrections', text: 'Cut counter-four (네 = four): it sounds exactly like "yes" (ne) and is unused elsewhere.', rec: 'accept' },
  { id: 'cut-help-me-please', group: 'Corrections', text: 'Cut help-me-please (jom do-wa-ju-se-yo): sounds almost like the emergency "Help!" (do-wa-ju-se-yo!).', rec: 'accept' },
  { id: 'rename-to-go', group: 'Corrections', text: 'Rename the food to-go English to "Pack it up to go, please" so it differs from the café "To go".', rec: 'accept' },
  { id: 'exclaim-calls', group: 'Corrections', text: 'Add "!" to call-ambulance and call-police.', rec: 'accept' },
  { id: 'rule-cross-word', group: 'Rule', text: 'Obligatory sound changes join words (못 해요 → mo-tae-yo); optional linking across a space keeps words apart (색 있어요 → saek i-sseo-yo). Document it in the Catalog header and ADR 0001.', rec: 'accept' },
  ...[
    ['yeo-kkwo-neul i-reo-beo-ryeo-sseo-yo', '여권을 잃어버렸어요', 'I lost my passport'],
    ['taek-ssi jom bul-leo ju-se-yo', '택시 좀 불러 주세요', 'Could you call me a taxi?'],
    ['hwan-jeon eo-di-seo hae-yo?', '환전 어디서 해요?', 'Where can I exchange money?'],
    ['yu-sim eo-di-seo sa-yo?', '유심 어디서 사요?', 'Where can I buy a SIM card?'],
    ['yo-geu-mi eol-ma-e-yo?', '요금이 얼마예요?', 'How much is the fare?'],
    ['ui-sa-ga pi-ryo-hae-yo', '의사가 필요해요', 'I need a doctor'],
    ['pyeon-do-ro ju-se-yo', '편도로 주세요', 'One-way, please'],
    ['beo-seu jeong-nyu-jang eo-di-e-yo?', '버스 정류장 어디예요?', 'Where is the bus stop?'],
    ['hwan-bu-rae ju-se-yo', '환불해 주세요', 'A refund, please'],
    ['wa-i-pa-i i-sseo-yo?', '와이파이 있어요?', 'Is there Wi-Fi?'],
    ['i-geo eo-tteo-ke hae-yo?', '이거 어떻게 해요?', 'How do I use this? (e.g. a kiosk)'],
    ['ye-ya-ka-go si-peo-yo', '예약하고 싶어요', "I'd like to make a reservation"],
  ].map(([rom, hangul, english], i) => ({ id: `add-${i + 1}`, group: 'Additions', text: english, rom, hangul, rec: 'accept' })),
  ...[
    ['youre-welcome', "cheon-ma-ne-yo (You're welcome): old-fashioned; a-ni-e-yo covers it.", 'reject'],
    ['hello-formal-heard', 'an-nyeong-ha-sim-ni-kka (very formal hello): heard from staff only.', 'reject'],
    ['this-station-heard', 'i-beon nyeo-geun (This station is …): half a sentence.', 'accept'],
    ['the-best', "chwe-go-e-yo (It's the best!): fun, not survival.", 'reject'],
    ['its-pretty', "ye-ppeo-yo (It's pretty): fun, not survival.", 'reject'],
    ['key-card', 'ka-deu-ki (key card): you receive it, you rarely say it.', 'accept'],
    ['map', 'ji-do (map): phones replaced it.', 'accept'],
  ].map(([id, text, rec]) => ({ id: `cut-${id}`, group: 'Cuts', text: `Cut ${text}`, rec })),
]

const data = {
  generatedAt: new Date().toISOString().slice(0, 10),
  catalogChars,
  phrases: [...new Set(results.map((r) => r.phrase))].map((id) => {
    const e = catalog.find((x) => x.id === id)!
    return { id, romanization: e.romanization, hangul: e.hangul, english: e.english }
  }),
  models: modelRows,
  clips: results.filter((r) => r.file).map((r) => ({
    label: r.label,
    voice: r.voice,
    voiceName: r.voiceName,
    gender: r.gender,
    phrase: r.phrase,
    src: r.file!,
    slow: r.slowFile!,
    duration: r.durationSec,
  })),
  topics,
  catalog: catalog.map((e) => ({ ...e, batch: batchOf.get(e.id) })),
  decisions,
}

const template = readFileSync(new URL('./voice-test-page.html', import.meta.url), 'utf8')
const json = JSON.stringify(data).replaceAll('<', '\\u003c')
writeFileSync(new URL('index.html', OUT), template.replace('__DATA__', () => json))

// Files for publishing with root voice-test/: each Clip is served at its path next to index.html.
const files = data.clips.flatMap((c) => [c.src, c.slow])
writeFileSync(new URL('files.json', OUT), JSON.stringify(files))
console.log(`Wrote voice-test/index.html (${data.clips.length} voice×phrase Clips, ${catalog.length} Expressions) and files.json (${files.length} files)`)
