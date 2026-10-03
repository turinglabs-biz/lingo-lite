import { describe, expect, it } from 'vitest'
import { gradeCard, newDirectionCard } from './scheduler.ts'
import {
  accuracyBy,
  cardsWithoutIgnored,
  computeStars,
  dayKey,
  dueCards,
  earnedStars,
  focusQueue,
  FOCUS_PER_BATCH,
  nextBatch,
  streaks,
  totalXp,
  withInput,
  withoutIgnored,
} from './progress.ts'
import type { Answer, DirectionCard, Session } from './types.ts'

const at = (d: number, h = 12) => new Date(2026, 8, d, h).getTime()
const session = (end?: number): Session => ({ id: String(Math.random()), type: 'review', startedAt: (end ?? at(1)) - 1000, endedAt: end, practiceMs: 0, lastInputAt: 0 })
const learnedCard = (id: string): DirectionCard => ({ ...newDirectionCard(id, 'speak', at(1)), stability: 10, learnedAt: at(2) })

describe('nextBatch', () => {
  const ordered = Array.from({ length: 40 }, (_, i) => ({ id: `e${i}`, topic: 'food' }))
  const ids = (batch: { id: string }[]) => batch.map((e) => e.id)
  /** A fixed random source, so picks are repeatable. */
  const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
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
  it('is exactly the Catalog order when nothing is in Focus', () => {
    expect(ids(nextBatch(ordered, new Set(), new Set(), seeded(1)))).toEqual(ids(ordered.slice(0, 15)))
  })
  it('takes up to 5 not-yet-introduced Focus Expressions, then Catalog order, keeping Catalog order', () => {
    const focus = new Set(['e20', 'e25', 'e30', 'e31', 'e32', 'e33', 'e39'])
    const batch = ids(nextBatch(ordered, new Set(), focus, seeded(7)))
    expect(batch).toHaveLength(15)
    expect(batch.filter((id) => focus.has(id))).toHaveLength(FOCUS_PER_BATCH)
    expect(batch.slice(0, 10)).toEqual(ids(ordered.slice(0, 10)))
    expect(batch).toEqual([...batch].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))
  })
  it('picks the Focus Expressions at random', () => {
    const focus = new Set(ordered.slice(20).map((e) => e.id))
    const picks = new Set([1, 2, 3, 4, 5].map((seed) => ids(nextBatch(ordered, new Set(), focus, seeded(seed))).join()))
    expect(picks.size).toBeGreaterThan(1)
  })
  it('never picks a Focus Expression that was already introduced', () => {
    const batch = ids(nextBatch(ordered, new Set(['e30']), new Set(['e30', 'e31']), seeded(3)))
    expect(batch).toContain('e31')
    expect(batch).not.toContain('e30')
  })
  it('keeps at most 3 Numbers Expressions in the Batch, Focus picks included', () => {
    const mixed = ordered.map((e, i) => ({ ...e, topic: i % 4 === 0 || i >= 30 ? 'numbers' : 'food' }))
    const focus = new Set(mixed.slice(30).map((e) => e.id))
    const batch = nextBatch(mixed, new Set(), focus, seeded(5))
    expect(batch).toHaveLength(15)
    expect(batch.filter((e) => e.topic === 'numbers')).toHaveLength(3)
  })
})

describe('dueCards', () => {
  const cards = [5, 1, 9, 3].map((d, i) => ({ ...newDirectionCard(`e${i}`, 'speak', 0), due: at(d) }))
  it('returns due cards, most overdue first, up to the limit', () => {
    expect(dueCards(cards, at(6), 2).map((c) => c.expressionId)).toEqual(['e1', 'e3'])
  })
  it('puts due Focus Directions first, even when less overdue', () => {
    expect(dueCards(cards, at(6), 2, new Set(['e0'])).map((c) => c.expressionId)).toEqual(['e0', 'e1'])
    expect(dueCards(cards, at(6), Infinity, new Set(['e0', 'e3'])).map((c) => c.expressionId)).toEqual(['e3', 'e0', 'e1'])
  })
  it('never selects a Focus Direction that is not due', () => {
    expect(dueCards(cards, at(6), Infinity, new Set(['e2'])).map((c) => c.expressionId)).toEqual(['e1', 'e3', 'e0'])
  })
})

describe('focusQueue', () => {
  const now = at(20)
  /** A card last reviewed on `day`: the longer ago, the less likely it is remembered now. */
  const reviewed = (id: string, day: number, direction: 'speak' | 'listen' = 'speak') => gradeCard(newDirectionCard(id, direction, at(day)), 'good', at(day))
  it('takes only Focus Expressions, least likely remembered first', () => {
    const cards = [reviewed('a', 19), reviewed('b', 10), reviewed('c', 15), reviewed('x', 1), newDirectionCard('d', 'speak', at(19))]
    expect(focusQueue(cards, new Set(['a', 'b', 'c', 'd']), now).map((c) => c.expressionId)).toEqual(['d', 'b', 'c', 'a'])
  })
  it('takes every existing Direction, due or not, up to the limit', () => {
    const notDue = { ...reviewed('a', 19, 'speak'), due: at(30) }
    const cards = [notDue, reviewed('a', 12, 'listen'), ...Array.from({ length: 30 }, (_, i) => reviewed(`f${i}`, 18))]
    expect(focusQueue(cards, new Set(['a']), now).map((c) => c.direction)).toEqual(['listen', 'speak'])
    expect(focusQueue(cards, new Set(cards.map((c) => c.expressionId)), now)).toHaveLength(20)
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

describe('Ignored Expressions', () => {
  const ordered = Array.from({ length: 20 }, (_, i) => ({ id: `e${i}`, topic: 'food' }))
  const ignored = new Set(['e0', 'e3'])

  it('are never part of a Batch, and the next one fills up from Catalog order instead', () => {
    const batch = nextBatch(withoutIgnored(ordered, ignored), new Set())
    expect(batch.map((e) => e.id)).not.toContain('e0')
    expect(batch.map((e) => e.id)).not.toContain('e3')
    expect(batch).toHaveLength(15)
    expect(batch[0].id).toBe('e1')
  })

  it('are never reviewed, even when due and in Focus', () => {
    const cards = [1, 2, 3].map((d, i) => ({ ...newDirectionCard(`e${i}`, 'speak', 0), due: at(d) }))
    const due = dueCards(cardsWithoutIgnored(cards, ignored), at(9), Infinity, new Set(['e0']))
    expect(due.map((c) => c.expressionId)).toEqual(['e1', 'e2'])
  })

  it('never reach a Focus session', () => {
    const cards = [newDirectionCard('e0', 'speak', at(1)), newDirectionCard('e1', 'speak', at(1))]
    expect(focusQueue(cardsWithoutIgnored(cards, ignored), new Set(['e0', 'e1']), at(5)).map((c) => c.expressionId)).toEqual(['e1'])
  })

  it('leave the rest untouched when nothing is Ignored', () => {
    expect(withoutIgnored(ordered, new Set())).toBe(ordered)
  })

  it('are left out of a Topic\'s Stars, so the rest can earn them', () => {
    const speakCards = new Map([['a', learnedCard('a')], ['b', learnedCard('b')]])
    // Three Expressions, one never learned: not all Learned. Ignore that one and the Topic is complete.
    expect(computeStars(['a', 'b', 'c'], new Set(['a', 'b', 'c']), speakCards)).toBe(1)
    expect(computeStars(withoutIgnored([{ id: 'a' }, { id: 'b' }, { id: 'c' }], new Set(['c'])).map((e) => e.id), new Set(['a', 'b']), speakCards)).toBe(3)
  })
})
