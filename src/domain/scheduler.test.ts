import { describe, expect, it } from 'vitest'
import { gradeCard, isLearned, LEARNED_STABILITY_DAYS, newDirectionCard } from './scheduler.ts'

const DAY = 86_400_000
const t0 = new Date(2026, 8, 27, 9).getTime()

describe('scheduler', () => {
  it('makes a new card due immediately', () => {
    const card = newDirectionCard('hello', 'speak', t0)
    expect(card.key).toBe('hello:speak')
    expect(card.due).toBeLessThanOrEqual(t0)
    expect(isLearned(card)).toBe(false)
  })

  it('schedules a Missed card sooner than a Got it card', () => {
    const card = newDirectionCard('hello', 'speak', t0)
    expect(gradeCard(card, 'missed', t0).due).toBeLessThan(gradeCard(card, 'good', t0).due)
  })

  it('marks a Speak card Learned once stability reaches 7 days, and records when', () => {
    let card = newDirectionCard('hello', 'speak', t0)
    let now = t0
    for (let i = 0; i < 12 && !isLearned(card); i++) {
      card = gradeCard(card, 'good', now)
      now = Math.max(card.due, now + 60_000)
    }
    expect(card.stability).toBeGreaterThanOrEqual(LEARNED_STABILITY_DAYS)
    expect(isLearned(card)).toBe(true)
    expect(card.learnedAt).toBeDefined()
    const learnedAt = card.learnedAt
    card = gradeCard(card, 'missed', card.due + DAY)
    expect(card.learnedAt).toBe(learnedAt)
  })

  it('never marks a Listen card as Learned', () => {
    let card = newDirectionCard('hello', 'listen', t0)
    let now = t0
    for (let i = 0; i < 12; i++) {
      card = gradeCard(card, 'good', now)
      now = Math.max(card.due, now + 60_000)
    }
    expect(isLearned(card)).toBe(false)
    expect(card.learnedAt).toBeUndefined()
  })
})

describe('See Direction', () => {
  it('schedules like the others but never counts as Learned', () => {
    let card = newDirectionCard('beer', 'see', t0)
    expect(card.key).toBe('beer:see')
    let now = t0
    for (let i = 0; i < 12; i++) {
      card = gradeCard(card, 'good', now)
      now = Math.max(card.due, now + 60_000)
    }
    expect(card.stability).toBeGreaterThan(LEARNED_STABILITY_DAYS)
    expect(isLearned(card)).toBe(false)
  })
})
