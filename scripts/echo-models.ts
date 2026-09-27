// Puts every Echo model into public/models/ for the build, checked against its pinned sha256 (ADR 0004). The app then
// serves it from our own server; learners never download from GitHub.
//
// Where a model comes from, first that works: already in public/ → the local cache (.cache/echo-models/, where you
// put freshly converted files) → the GitHub Release (ECHO_RELEASE_URL). See the README's Echo section.
//
//   node scripts/echo-models.ts            fetch whatever is missing
//   node scripts/echo-models.ts --check    verify every model is present and intact; exit 1 if not
import { createHash } from 'node:crypto'
import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { ECHO_MODELS, modelFileName, modelPath, modelReleaseUrl, type EchoModel } from '../src/echo/models.ts'

const ROOT = new URL('..', import.meta.url).pathname
const target = (m: EchoModel) => join(ROOT, 'public', modelPath(m))
const cached = (m: EchoModel) => join(ROOT, '.cache/echo-models', modelFileName(m))

async function sha256(file: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(file), hash)
  return hash.digest('hex')
}

const intact = async (m: EchoModel, file: string) =>
  existsSync(file) && statSync(file).size === m.file.bytes && (await sha256(file)) === m.file.sha256

if (process.argv.includes('--check')) {
  let bad = 0
  for (const m of ECHO_MODELS) {
    const ok = await intact(m, target(m))
    console.log(`${m.id}: ${ok ? 'ok' : 'missing or corrupt'} (${modelPath(m)})`)
    if (!ok) bad++
  }
  process.exit(bad ? 1 : 0)
}

for (const m of ECHO_MODELS) {
  const file = target(m)
  if (await intact(m, file)) {
    console.log(`${m.id}: already there`)
    continue
  }
  mkdirSync(dirname(file), { recursive: true })
  if (await intact(m, cached(m))) {
    copyFileSync(cached(m), file)
    console.log(`${m.id}: copied from the local cache`)
    continue
  }
  const url = modelReleaseUrl(m)
  console.log(`${m.id}: downloading ${(m.file.bytes / 1e6).toFixed(0)} MB from ${url}`)
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`${m.id}: ${res.status} from ${url}`)
  const partial = `${file}.part`
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(partial))
  if (!(await intact(m, partial))) throw new Error(`${m.id}: the download doesn't match its pinned sha256`)
  renameSync(partial, file)
}
