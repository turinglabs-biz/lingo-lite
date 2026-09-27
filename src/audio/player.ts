import { expressionById } from '../catalog/index.ts'
import { clipUrl, pickVoice, type Speed, type Voice } from './voices.ts'

// One shared element: starting a Clip stops the previous one, and iOS only needs it unlocked once by a tap.
const audio = typeof Audio !== 'undefined' ? new Audio() : undefined
const lastHeard = new Map<string, Voice>()

/**
 * Plays a Clip: Normal picks a random Voice, Slow repeats the Voice just heard for that Expression.
 * Never rejects; autoplay that the browser blocks is silently skipped (the play buttons still work).
 */
export async function playClip(expressionId: string, speed: Speed): Promise<void> {
  const voice = pickVoice(speed, lastHeard.get(expressionId))
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
