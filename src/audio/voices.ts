/** The two Voices used for every Clip. Ids match the folders under public/audio/. */
export const VOICES = ['female', 'male'] as const
export type Voice = (typeof VOICES)[number]

export type Speed = 'normal' | 'slow'

/** Normal playback picks a random Voice; Slow replays the Voice just heard (or picks one if none yet). */
export function pickVoice(speed: Speed, lastHeard: Voice | undefined, random = Math.random): Voice {
  if (speed === 'slow' && lastHeard) return lastHeard
  return VOICES[Math.floor(random() * VOICES.length)]
}

export function clipUrl(expressionId: string, voice: Voice, speed: Speed): string {
  const base = import.meta.env.BASE_URL
  return `${base}audio/${voice}/${expressionId}${speed === 'slow' ? '.slow' : ''}.mp3`
}
