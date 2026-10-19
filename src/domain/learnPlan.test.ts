import { describe, expect, it } from 'vitest'
import { afterAttemptGrade, planLearnSession, SPEAK_ROUNDS } from './learnPlan.ts'

const ids = Array.from({ length: 15 }, (_, i) => `e${i}`)

describe('planLearnSession', () => {
  const steps = planLearnSession(ids)

  it('shows each Expression before checking it', () => {
    for (const id of ids) {
      const shown = steps.findIndex((s) => s.kind === 'expose' && s.id === id)
      const checked = steps.findIndex((s) => s.kind === 'check' && s.id === id)
      expect(shown).toBeGreaterThanOrEqual(0)
      expect(checked).toBeGreaterThan(shown)
    }
  })

  it('asks every Expression to be spoken once per round, after all exposure', () => {
    const lastCheck = steps.map((s) => s.kind).lastIndexOf('check')
    const speaks = steps.filter((s) => s.kind === 'speak')
    expect(speaks).toHaveLength(ids.length * SPEAK_ROUNDS)
    expect(steps.findIndex((s) => s.kind === 'speak')).toBeGreaterThan(lastCheck)
  })

  it('handles a short final Batch', () => {
    const short = planLearnSession(['a', 'b'])
    expect(short.filter((s) => s.kind === 'check')).toHaveLength(2)
  })
})

describe('afterAttemptGrade', () => {
  it('adds one more attempt only for a Missed answer in the last round', () => {
    const steps = planLearnSession(['a', 'b'])
    expect(afterAttemptGrade(steps, { kind: 'speak', id: 'a', round: 1 }, true)).toBe(steps)
    expect(afterAttemptGrade(steps, { kind: 'speak', id: 'a', round: SPEAK_ROUNDS }, false)).toBe(steps)
    const more = afterAttemptGrade(steps, { kind: 'speak', id: 'a', round: SPEAK_ROUNDS }, true)
    expect(more.at(-1)).toEqual({ kind: 'speak', id: 'a', round: SPEAK_ROUNDS + 1 })
    expect(afterAttemptGrade(more, more.at(-1)!, true)).toBe(more)
  })
})

describe('Heard Expressions in a Learn session', () => {
  const heard = new Set(['h1', 'h2'])
  const steps = planLearnSession(['a', 'h1', 'b', 'h2'], Math.random, heard)

  it('are shown and checked like any Expression', () => {
    expect(steps.filter((s) => s.kind === 'expose').map((s) => s.id).sort()).toEqual(['a', 'b', 'h1', 'h2'])
    expect(steps.filter((s) => s.kind === 'check')).toHaveLength(4)
  })

  it('get Listen attempts and never Speak ones', () => {
    expect(steps.filter((s) => s.kind === 'speak' && heard.has(s.id))).toEqual([])
    expect(steps.filter((s) => s.kind === 'listen').map((s) => s.id).sort()).toEqual(['h1', 'h1', 'h2', 'h2'])
    expect(steps.filter((s) => s.kind === 'speak').map((s) => s.id).sort()).toEqual(['a', 'a', 'b', 'b'])
  })

  it('earn one more Listen attempt for a miss in the last round', () => {
    const more = afterAttemptGrade(steps, { kind: 'listen', id: 'h1', round: SPEAK_ROUNDS }, true)
    expect(more.at(-1)).toEqual({ kind: 'listen', id: 'h1', round: SPEAK_ROUNDS + 1 })
  })
})
