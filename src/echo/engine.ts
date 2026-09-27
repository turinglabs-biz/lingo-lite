// Runs an Echo model on the phone with ONNX Runtime Web: WebGPU where the browser has it, WebAssembly otherwise.
// Everything is read from the files stored by store.ts, so it works offline.
import type { InferenceSession } from 'onnxruntime-web'
import type { EchoModel } from './models.ts'
import { normaliseAudio } from './models.ts'
import { toModelOutput, type ModelOutput } from './scorer.ts'
import { readEngine, readModel } from './store.ts'

export type Backend = 'webgpu' | 'wasm'

export interface LoadedModel {
  model: EchoModel
  backend: Backend
  /** How long loading took, in ms. */
  loadMs: number
  /** Runs the model on 16 kHz mono samples. */
  run(samples: Float32Array): Promise<{ output: ModelOutput; ms: number }>
  release(): Promise<void>
}

let loading: { id: string; promise: Promise<LoadedModel> } | null = null

/** Loads a model, or returns the one already loaded. Loading a different model releases the previous one. */
export function loadModel(model: EchoModel): Promise<LoadedModel> {
  if (loading?.id === model.id) return loading.promise
  const previous = loading?.promise
  const promise = (async () => {
    await previous?.then((m) => m.release()).catch(() => {})
    return create(model)
  })()
  loading = { id: model.id, promise }
  promise.catch(() => {
    if (loading?.promise === promise) loading = null
  })
  return promise
}

export async function unloadModel(): Promise<void> {
  const current = loading?.promise
  loading = null
  await current?.then((m) => m.release()).catch(() => {})
}

async function create(model: EchoModel): Promise<LoadedModel> {
  const started = performance.now()
  const ort = await import('onnxruntime-web')
  ort.env.wasm.wasmBinary ??= await readEngine()
  const bytes = new Uint8Array(await readModel(model))

  let session: InferenceSession | null = null
  let backend: Backend = 'wasm'
  if ('gpu' in navigator) {
    try {
      session = await ort.InferenceSession.create(bytes, { executionProviders: ['webgpu'] })
      backend = 'webgpu'
    } catch (err) {
      console.warn('Echo: WebGPU unavailable, using WebAssembly', err)
    }
  }
  session ??= await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] })
  const loadMs = performance.now() - started

  return {
    model,
    backend,
    loadMs,
    async run(samples) {
      const t0 = performance.now()
      const x = normaliseAudio(samples)
      const result = await session.run({ input_values: new ort.Tensor('float32', x, [1, x.length]) })
      const logits = result.logits
      const data = (await logits.getData()) as Float32Array
      const output = toModelOutput(data, logits.dims[1], model.vocabulary, model.blankTokens)
      logits.dispose()
      return { output, ms: performance.now() - t0 }
    },
    release: () => session.release(),
  }
}
