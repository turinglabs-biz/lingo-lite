import { describe, expect, it } from 'vitest'
import { clipUrl, pickVoice } from './voices.ts'

describe('pickVoice', () => {
  it('picks a random Voice for Normal playback, ignoring the last one', () => {
    expect(pickVoice('normal', 'male', () => 0)).toBe('female')
    expect(pickVoice('normal', 'female', () => 0.99)).toBe('male')
  })

  it('replays the Voice just heard for Slow playback', () => {
    expect(pickVoice('slow', 'male', () => 0)).toBe('male')
  })

  it('picks a random Voice for Slow playback when nothing was heard yet', () => {
    expect(pickVoice('slow', undefined, () => 0.99)).toBe('male')
  })
})

describe('clipUrl', () => {
  it('points Normal and Slow Clips at their files', () => {
    expect(clipUrl('hello', 'female', 'normal')).toBe('/audio/female/hello.mp3')
    expect(clipUrl('hello', 'male', 'slow')).toBe('/audio/male/hello.slow.mp3')
  })
})
