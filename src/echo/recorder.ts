// Hold-to-talk recording for Echo. Uses MediaRecorder rather than an AudioContext: on iOS a touch that starts a hold
// doesn't count as a user gesture for audio, but recording needs none once the mic is allowed. The microphone is only
// open while the button is held, and nothing is kept once the recording has been scored.

export const MAX_SECONDS = 10
export const SAMPLE_RATE = 16_000

export interface Recorded {
  /** 16 kHz mono. */
  samples: Float32Array
  seconds: number
  /** The recording as the browser encoded it, for playback. */
  blob: Blob
}

export interface Recording {
  /** Resolves once the microphone is actually capturing. */
  started: Promise<void>
  stop(): Promise<Recorded | null>
}

/** Asks for the microphone once, then releases it. Returns false if the learner refused. */
export async function requestMicrophone(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    for (const track of stream.getTracks()) track.stop()
    return true
  } catch {
    return false
  }
}

/** Starts recording; stops by itself after MAX_SECONDS (calling onAutoStop). */
export function startRecording(onAutoStop: () => void): Recording {
  const chunks: Blob[] = []
  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let startedAt = 0
  let stoppedAt = 0
  let cancelled = false
  let timer = 0

  const started = (async () => {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } })
    if (cancelled) return release()
    recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    await new Promise<void>((resolve) => {
      recorder!.onstart = () => resolve()
      recorder!.start()
    })
    startedAt = performance.now()
    timer = window.setTimeout(onAutoStop, MAX_SECONDS * 1000)
  })()

  function release() {
    for (const track of stream?.getTracks() ?? []) track.stop()
    stream = null
  }

  return {
    started,
    async stop() {
      cancelled = true
      window.clearTimeout(timer)
      await started.catch(() => {})
      if (!recorder || recorder.state === 'inactive') {
        release()
        return null
      }
      stoppedAt = performance.now()
      const done = new Promise<void>((resolve) => (recorder!.onstop = () => resolve()))
      recorder.stop()
      await done
      release()
      const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type })
      const samples = await decode(await blob.arrayBuffer())
      return { samples, seconds: (stoppedAt - startedAt) / 1000, blob }
    },
  }
}

/** Decodes any audio the browser can play (a recording, a Clip) to 16 kHz mono. */
export async function decode(data: ArrayBuffer): Promise<Float32Array> {
  if (data.byteLength === 0) return new Float32Array(0)
  try {
    // decodeAudioData resamples to the context's rate, and needs no user gesture on an offline context.
    const buffer = await new OfflineAudioContext(1, 1, SAMPLE_RATE).decodeAudioData(data)
    return buffer.getChannelData(0).slice()
  } catch {
    // Some browsers refuse a 16 kHz context: decode at the default rate and resample by hand.
    const buffer = await new OfflineAudioContext(1, 1, 48_000).decodeAudioData(data)
    return resample(buffer.getChannelData(0), buffer.sampleRate, SAMPLE_RATE)
  }
}

/** Averages each output sample over the input samples it covers (a simple low-pass), enough for speech. */
function resample(input: Float32Array, from: number, to: number): Float32Array {
  const ratio = from / to
  const out = new Float32Array(Math.floor(input.length / ratio))
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio)
    const end = Math.min(input.length, Math.floor((i + 1) * ratio))
    let sum = 0
    for (let j = start; j < end; j++) sum += input[j]
    out[i] = sum / Math.max(1, end - start)
  }
  return out
}
