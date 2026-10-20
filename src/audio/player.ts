import { expressionById } from '../catalog/index.ts'
import { clipUrl, pickVoice, type Speed, type Voice } from './voices.ts'

// One shared element: starting a Clip stops the previous one, and iOS only needs it unlocked once by a tap.
const audio = typeof Audio !== 'undefined' ? new Audio() : undefined
const lastHeard = new Map<string, Voice>()

/**
 * Plays a Clip: Normal picks a random Voice, Slow repeats the Voice just heard for that Expression. A Conversation
 * passes its speaker's Voice instead, so each speaker keeps one Voice for the whole run.
 * Never rejects; autoplay that the browser blocks is silently skipped (the play buttons still work).
 */
export async function playClip(expressionId: string, speed: Speed, fixedVoice?: Voice): Promise<void> {
  const voice = fixedVoice ?? pickVoice(speed, lastHeard.get(expressionId))
  lastHeard.set(expressionId, voice)
  if (!audio) return
  audio.src = clipUrl(expressionId, voice, speed)
  try {
    await audio.play()
  } catch (err) {
    if ((err as DOMException).name === 'NotAllowedError' || (err as DOMException).name === 'AbortError') return
    // Clip missing: fall back to the device's Korean voice.
    speakWithDevice(expressionId, speed)
  }
}

/**
 * Plays a Clip and resolves once it has finished, failed or been replaced, so a Conversation can play one speaker
 * after the other. A safety timeout keeps a stalled Clip from blocking.
 */
export function playClipToEnd(expressionId: string, speed: Speed, fixedVoice?: Voice): Promise<void> {
  return new Promise((resolve) => {
    if (!audio) return resolve()
    const events = ['ended', 'error', 'pause', 'emptied'] as const
    const timer = setTimeout(done, 10_000)
    function done() {
      clearTimeout(timer)
      events.forEach((e) => audio!.removeEventListener(e, done))
      resolve()
    }
    playClip(expressionId, speed, fixedVoice).then(() => events.forEach((e) => audio!.addEventListener(e, done)))
  })
}

export function stopClip() {
  audio?.pause()
}

function speakWithDevice(expressionId: string, speed: Speed) {
  const expression = expressionById.get(expressionId)
  if (!expression || typeof speechSynthesis === 'undefined') return
  const utterance = new SpeechSynthesisUtterance(expression.hangul)
  utterance.lang = 'ko-KR'
  utterance.rate = speed === 'slow' ? 0.75 : 1
  speechSynthesis.speak(utterance)
}
