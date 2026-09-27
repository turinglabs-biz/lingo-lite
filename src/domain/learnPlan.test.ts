import { describe, expect, it } from 'vitest'
import { afterSpeakGrade, planLearnSession, SPEAK_ROUNDS } from './learnPlan.ts'

const ids = Array.from({ length: 15 }, (_, i) => `e${i}`)

describe('planLearnSession', () => {
  const steps = planLearnSession(ids, ['x1', 'x2', 'x3'])

  it('shows each Expression before checking it', () => {
    for (const id of ids) {
      const shown = steps.findIndex((s) => s.kind === 'expose' && s.id === id)
      const checked = steps.findIndex((s) => s.kind === 'check' && s.id === id)
      expect(shown).toBeGreaterThanOrEqual(0)
      expect(checked).toBeGreaterThan(shown)
    }
  })

  it('gives every check 4 distinct options including the answer', () => {
    for (const s of steps) {
      if (s.kind !== 'check') continue
      expect(new Set(s.options).size).toBe(4)
      expect(s.options).toContain(s.id)
    }
  })

  it('asks every Expression to be spoken once per round, after all exposure', () => {
    const lastCheck = steps.map((s) => s.kind).lastIndexOf('check')
    const speaks = steps.filter((s) => s.kind === 'speak')
    expect(speaks).toHaveLength(ids.length * SPEAK_ROUNDS)
    expect(steps.findIndex((s) => s.kind === 'speak')).toBeGreaterThan(lastCheck)
  })

  it('handles a short final Batch', () => {
    const short = planLearnSession(['a', 'b'], ['c', 'd', 'e'])
    expect(short.filter((s) => s.kind === 'check').every((s) => s.kind === 'check' && s.options.length === 4)).toBe(true)
  })
})

describe('afterSpeakGrade', () => {
  it('adds one more attempt only for a Missed answer in the last round', () => {
    const steps = planLearnSession(['a', 'b'], ['c', 'd', 'e'])
    expect(afterSpeakGrade(steps, { kind: 'speak', id: 'a', round: 1 }, true)).toBe(steps)
    expect(afterSpeakGrade(steps, { kind: 'speak', id: 'a', round: SPEAK_ROUNDS }, false)).toBe(steps)
    const more = afterSpeakGrade(steps, { kind: 'speak', id: 'a', round: SPEAK_ROUNDS }, true)
    expect(more.at(-1)).toEqual({ kind: 'speak', id: 'a', round: SPEAK_ROUNDS + 1 })
    expect(afterSpeakGrade(more, more.at(-1)!, true)).toBe(more)
  })
})
