import { describe, expect, it } from 'vitest'
import { catalog } from '../catalog/index.ts'
import { directionsOf, learnedDirection, scheduledCards } from './directions.ts'
import { computeStars } from './progress.ts'
import { gradeCard, isLearned, newDirectionCard } from './scheduler.ts'

const DAY = 86_400_000

describe('Heard Expressions', () => {
  it('have only the Listen Direction, which decides Learned', () => {
    expect(directionsOf({ heard: true })).toEqual(['listen'])
    expect(learnedDirection({ heard: true })).toBe('listen')
    expect(directionsOf({})).toEqual(['speak', 'listen', 'see'])
    expect(learnedDirection({})).toBe('speak')
  })

  it('are Learned by Listen, while an ordinary Expression never is', () => {
    const listen = { ...newDirectionCard('h', 'listen', 0), stability: 10 }
    expect(isLearned(listen, 'listen')).toBe(true)
    expect(isLearned(listen)).toBe(false)
  })

  it('record learnedAt when their Listen card reaches Learned', () => {
    let card = newDirectionCard('h', 'listen', 0)
    let now = 0
    for (let i = 0; i < 8 && !card.learnedAt; i++) {
      card = gradeCard(card, 'good', now, false, 'listen')
      now = card.due + DAY
    }
    expect(card.learnedAt).toBeDefined()
  })

  it('count toward a Topic\'s Stars through their Listen card', () => {
    const learnedCards = new Map([
      ['a', { ...newDirectionCard('a', 'speak', 0), stability: 10 }],
      ['h', { ...newDirectionCard('h', 'listen', 0), stability: 10 }],
    ])
    expect(computeStars(['a', 'h'], new Set(['a', 'h']), learnedCards)).toBe(3)
  })

  it('keep their old Speak and See cards out of the schedule', () => {
    const cards = (['speak', 'listen', 'see'] as const).flatMap((d) => [newDirectionCard('h', d, 0), newDirectionCard('a', d, 0)])
    const kept = scheduledCards(cards, new Set(['h']))
    expect(kept.filter((c) => c.expressionId === 'h').map((c) => c.direction)).toEqual(['listen'])
    expect(kept.filter((c) => c.expressionId === 'a')).toHaveLength(3)
  })

  it('include the five Expressions a traveller only ever hears, but not one they can ask back', () => {
    const heard = catalog.filter((e) => e.heard).map((e) => e.id)
    for (const id of ['welcome-heard', 'how-many-heard', 'for-here-heard', 'this-station-heard', 'hello-formal-heard']) {
      expect(heard).toContain(id)
    }
    expect(heard).not.toContain('where-from-heard')
  })
})
