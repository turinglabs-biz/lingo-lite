// Keeps Echo's files on the phone for offline use: the model and the speech engine (ONNX Runtime's WebAssembly), in
// Cache Storage. Nothing here is precached: the files are only downloaded when the learner turns Echo on.
import engineAsset from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url'
import { ECHO_MODELS, modelPath, type EchoModel } from './models.ts'

const CACHE = 'echo'

/** Size of the speech engine, measured at build time. */
export const ENGINE_BYTES: number = __ECHO_ENGINE_BYTES__

const absolute = (path: string) => new URL(path, location.href).href
export const modelUrl = (m: EchoModel) => absolute(`${import.meta.env.BASE_URL}${modelPath(m)}`)
export const engineUrl = () => absolute(engineAsset)

async function cached(url: string): Promise<Response | undefined> {
  if (typeof caches === 'undefined') return undefined
  return (await caches.open(CACHE)).match(url)
}

/** Whether this model and the engine this build expects are both stored. A new model revision or engine version is
 * a new URL, so an outdated copy counts as missing. */
export async function isDownloaded(m: EchoModel): Promise<boolean> {
  const [model, engine] = await Promise.all([cached(modelUrl(m)), cached(engineUrl())])
  return !!model && !!engine
}

/** Bytes still to download to turn this model on. */
export async function bytesToDownload(m: EchoModel): Promise<number> {
  return ((await cached(modelUrl(m))) ? 0 : m.file.bytes) + ((await cached(engineUrl())) ? 0 : ENGINE_BYTES)
}

/**
 * Downloads whatever is missing, reporting progress in bytes. Files are stored only once complete; an interrupted
 * download stores nothing. Old revisions of this model and old engines are deleted afterwards.
 */
export async function download(m: EchoModel, onProgress: (loaded: number, total: number) => void): Promise<void> {
  const cache = await caches.open(CACHE)
  const todo = [
    { url: engineUrl(), bytes: ENGINE_BYTES },
    { url: modelUrl(m), bytes: m.file.bytes },
  ]
  const missing = (await Promise.all(todo.map(async (f) => ((await cache.match(f.url)) ? null : f)))).filter((f) => f !== null)
  const total = missing.reduce((sum, f) => sum + f.bytes, 0)
  let loaded = 0
  onProgress(0, total)
  for (const f of missing) {
    const res = await fetch(f.url, { cache: 'no-store' })
    if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`)
    // One branch goes straight into the cache, the other only counts bytes, so the file is never held in memory twice.
    const [toCache, toCount] = res.body.tee()
    const stored = cache.put(f.url, new Response(toCache, { headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream' } }))
    const reader = toCount.getReader()
    for (let r = await reader.read(); !r.done; r = await reader.read()) {
      loaded += r.value.byteLength
      onProgress(Math.min(loaded, total), total)
    }
    await stored
  }
  await removeOutdated()
}

/** Deletes this model. The engine goes too once no model is left. */
export async function remove(m: EchoModel): Promise<void> {
  const cache = await caches.open(CACHE)
  await cache.delete(modelUrl(m))
  const others = await Promise.all(ECHO_MODELS.filter((o) => o.id !== m.id).map((o) => cache.match(modelUrl(o))))
  if (!others.some(Boolean)) await cache.delete(engineUrl())
  await removeOutdated()
}

async function removeOutdated() {
  const cache = await caches.open(CACHE)
  const current = new Set([engineUrl(), ...ECHO_MODELS.map(modelUrl)])
  for (const request of await cache.keys()) if (!current.has(request.url)) await cache.delete(request)
}

export async function readModel(m: EchoModel): Promise<ArrayBuffer> {
  const res = await cached(modelUrl(m))
  if (!res) throw new Error('The model is not downloaded')
  return res.arrayBuffer()
}

export async function readEngine(): Promise<ArrayBuffer> {
  const res = await cached(engineUrl())
  if (!res) throw new Error('The speech engine is not downloaded')
  return res.arrayBuffer()
}
