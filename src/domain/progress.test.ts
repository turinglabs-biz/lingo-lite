import { describe, expect, it } from 'vitest'
import { newDirectionCard } from './scheduler.ts'
import { accuracyBy, computeStars, dayKey, dueCards, earnedStars, nextBatch, streaks, totalXp, withInput } from './progress.ts'
import type { Answer, DirectionCard, Session } from './types.ts'

const at = (d: number, h = 12) => new Date(2026, 8, d, h).getTime()
const session = (end?: number): Session => ({ id: String(Math.random()), type: 'review', startedAt: (end ?? at(1)) - 1000, endedAt: end, practiceMs: 0, lastInputAt: 0 })
const learnedCard = (id: string): DirectionCard => ({ ...newDirectionCard(id, 'speak', at(1)), stability: 10, learnedAt: at(2) })

describe('nextBatch', () => {
  const ordered = Array.from({ length: 40 }, (_, i) => ({ id: `e${i}` }))
  it('takes the next 15 never-introduced Expressions in Catalog order', () => {
    const batch = nextBatch(ordered, new Set(['e0', 'e2']))
    expect(batch).toHaveLength(15)
    expect(batch[0].id).toBe('e1')
    expect(batch.map((e) => e.id)).not.toContain('e2')
  })
  it('returns a shorter final Batch and then nothing', () => {
    expect(nextBatch(ordered, new Set(ordered.slice(0, 30).map((e) => e.id)))).toHaveLength(10)
    expect(nextBatch(ordered, new Set(ordered.map((e) => e.id)))).toHaveLength(0)
  })
})

describe('dueCards', () => {
  it('returns due cards, most overdue first, up to the limit', () => {
    const cards = [5, 1, 9, 3].map((d, i) => ({ ...newDirectionCard(`e${i}`, 'speak', 0), due: at(d) }))
    expect(dueCards(cards, at(6), 2).map((c) => c.expressionId)).toEqual(['e1', 'e3'])
  })
})

describe('Stars', () => {
  const ids = ['a', 'b', 'c', 'd', 'e']
  it('earns one when every Expression is introduced', () => {
    expect(computeStars(ids, new Set(ids), new Map())).toBe(1)
    expect(computeStars(ids, new Set(ids.slice(1)), new Map())).toBe(0)
  })
  it('earns two at 80% Learned and three at 100%', () => {
    const four = new Map(ids.slice(0, 4).map((id) => [id, learnedCard(id)]))
    expect(computeStars(ids, new Set(ids), four)).toBe(2)
    const all = new Map(ids.map((id) => [id, learnedCard(id)]))
    expect(computeStars(ids, new Set(ids), all)).toBe(3)
  })
  it('never drops once earned', () => {
    expect(earnedStars(3, 1)).toBe(3)
    expect(earnedStars(1, 2)).toBe(2)
  })
})

describe('XP', () => {
  it('counts answers, first-time Learned Expressions and finished sessions', () => {
    const answers = [1, 2, 3].map((i) => ({ at: i, sessionId: 's', expressionId: 'a', kind: 'speak', correct: true }) as Answer)
    const cards = [learnedCard('a'), newDirectionCard('b', 'speak', 0)]
    expect(totalXp(answers, cards, [session(at(1)), session()])).toBe(3 + 2 + 5)
  })
})

describe('Streak', () => {
  it('counts consecutive days with a finished session, ending today', () => {
    const s = [session(at(20)), session(at(21, 23)), session(at(22, 0)), session(at(22, 18))]
    expect(streaks(s, at(22, 20))).toEqual({ current: 3, longest: 3 })
  })
  it('stays alive until the end of the next day', () => {
    expect(streaks([session(at(21))], at(22, 23)).current).toBe(1)
    expect(streaks([session(at(21))], at(23, 1)).current).toBe(0)
  })
  it('ignores abandoned sessions and reports the longest run', () => {
    const s = [session(at(1)), session(at(2)), session(at(3)), session(at(10)), session()]
    expect(streaks(s, at(10))).toEqual({ current: 1, longest: 3 })
  })
  it('uses local calendar days across midnight', () => {
    expect(dayKey(new Date(2026, 8, 21, 23, 59).getTime())).toBe('2026-09-21')
    expect(dayKey(new Date(2026, 8, 22, 0, 1).getTime())).toBe('2026-09-22')
  })
})

describe('Practice time', () => {
  it('adds gaps between inputs up to 60 s and ignores longer idle gaps', () => {
    let s: Session = { id: 's', type: 'learn', startedAt: 0, practiceMs: 0, lastInputAt: 0 }
    s = withInput(s, 10_000)
    s = withInput(s, 70_000)
    s = withInput(s, 200_000)
    s = withInput(s, 205_000)
    expect(s.practiceMs).toBe(10_000 + 60_000 + 5_000)
  })
})

describe('accuracyBy', () => {
  it('separates Speak, Listen and check answers', () => {
    const a = (kind: Answer['kind'], correct: boolean) => ({ at: 0, sessionId: 's', expressionId: 'x', kind, correct }) as Answer
    const acc = accuracyBy([a('speak', true), a('speak', false), a('listen', true), a('check', true)])
    expect(acc.speak).toEqual({ answers: 2, correct: 1 })
    expect(acc.listen).toEqual({ answers: 1, correct: 1 })
    expect(acc.check).toEqual({ answers: 1, correct: 1 })
  })
})

describe('accuracyBy with See', () => {
  it('reports See separately', () => {
    const a = (kind: Answer['kind'], correct: boolean) => ({ at: 0, sessionId: 's', expressionId: 'x', kind, correct }) as Answer
    expect(accuracyBy([a('see', true), a('see', false)]).see).toEqual({ answers: 2, correct: 1 })
  })
})
