import { describe, expect, it } from 'vitest'
import { MIN_FRAMES, echoScore, rawScore, scoreEcho, type ModelOutput } from './scorer.ts'
import { expectedSounds } from './sounds.ts'

const columns = ['', 'A', 'E', 'I', 'N', 'S', 'H', 'G', 'iE', 'iO']

/**
 * A made-up model output: one frame per entry, '_' for silence (blank). Each frame gives its sound 90% and spreads
 * the rest evenly, like a confident model.
 */
function heard(frames: string[]): ModelOutput {
  const logProbs = new Float32Array(frames.length * columns.length)
  frames.forEach((f, t) => {
    const hit = f === '_' ? 0 : columns.indexOf(f)
    if (hit < 0) throw new Error(f)
    for (let c = 0; c < columns.length; c++) logProbs[t * columns.length + c] = Math.log(c === hit ? 0.9 : 0.1 / (columns.length - 1))
  })
  return { logProbs, frames: frames.length, columns }
}

/** A recording: silence, then each sound for two frames with a short gap, then silence. */
const say = (...sounds: string[]) => heard(['_', '_', '_', '_', '_', ...sounds.flatMap((s) => [s, s, '_']), '_', '_', '_', '_', '_'])
const expect_ = (romanization: string) => expectedSounds(romanization, columns.slice(1))
const raw = (output: ModelOutput, romanization: string) => {
  const r = rawScore(output, expect_(romanization))
  if (r.kind !== 'heard') throw new Error(r.reason)
  return r.raw
}
const full = { full: 1, zero: 0 }

describe('scoreEcho', () => {
  it('scores a recording of exactly the expected sounds at about 100%', () => {
    const r = scoreEcho(say('A', 'N', 'I', 'E', 'iO'), expect_('a-ni-e-yo'), full)
    expect(r.kind).toBe('heard')
    if (r.kind === 'heard') expect(r.score).toBeGreaterThanOrEqual(95)
  })

  it('scores a different Expression near 0%', () => {
    expect(raw(say('G', 'A', 'S', 'A', 'iO'), 'ne')).toBeLessThan(0.1)
  })

  it('scores one wrong sound between all right and all wrong', () => {
    const right = raw(say('S', 'A', 'N', 'iO'), 'sa-nyo')
    const oneWrong = raw(say('S', 'E', 'N', 'iO'), 'sa-nyo')
    const allWrong = raw(say('G', 'E', 'H', 'I'), 'sa-nyo')
    expect(oneWrong).toBeLessThan(right)
    expect(oneWrong).toBeGreaterThan(allWrong)
    expect(oneWrong).toBeCloseTo(0.75, 1)
  })

  it('scores more wrong sounds lower than fewer', () => {
    const one = raw(say('S', 'E', 'N', 'iO'), 'sa-nyo')
    const two = raw(say('S', 'E', 'N', 'iE'), 'sa-nyo')
    expect(two).toBeLessThan(one)
  })

  it('accepts the variants natives use: a swallowed h, e for ye', () => {
    expect(raw(say('A', 'N', 'A', 'S', 'E', 'iO'), 'an-ha-se-yo')).toBeGreaterThan(0.9)
    expect(raw(say('G', 'iE', 'S', 'E', 'iO'), 'ge-se-yo')).toBeGreaterThan(0.9)
  })

  it('says not heard, with a reason, instead of scoring silence or a clipped recording', () => {
    expect(scoreEcho(heard(Array(40).fill('_')), expect_('ne'), full)).toEqual({ kind: 'not-heard', reason: 'no-speech' })
    expect(scoreEcho(heard(['N', 'E', ...Array(MIN_FRAMES - 3).fill('_')]), expect_('ne'), full)).toEqual({
      kind: 'not-heard',
      reason: 'too-short',
    })
    const long = 'a-ni-e-yo a-ni-e-yo a-ni-e-yo a-ni-e-yo'
    expect(scoreEcho(heard(['A', ...Array(MIN_FRAMES).fill('_')]), expect_(long), full)).toEqual({
      kind: 'not-heard',
      reason: 'too-short-for-sounds',
    })
  })

  it('passes the raw score through and rates each sound', () => {
    const output = say('S', 'E', 'N', 'iO')
    const r = scoreEcho(output, expect_('sa-nyo'), { full: 0.9, zero: 0.1 })
    if (r.kind !== 'heard') throw new Error('not heard')
    expect(r.raw).toBe(raw(output, 'sa-nyo'))
    expect(r.sounds.map((s) => s.sound)).toEqual(['S', 'A', 'N', 'iO'])
    expect(r.sounds[1].rating).toBeLessThan(0.1)
  })
})

describe('echoScore', () => {
  it('maps the raw score linearly between the reference points, clamped and rounded', () => {
    const ref = { full: 0.9, zero: 0.1 }
    expect(echoScore(0.5, ref)).toBe(50)
    expect(echoScore(0.95, ref)).toBe(100)
    expect(echoScore(0.05, ref)).toBe(0)
    expect(echoScore(0.3333, ref)).toBe(29)
  })

  it('never divides by zero when the reference points are almost equal', () => {
    expect(echoScore(0.52, { full: 0.5, zero: 0.5 })).toBe(40)
    expect(Number.isFinite(echoScore(0.5, { full: 0.5, zero: 0.5 }))).toBe(true)
  })
})
