import { createEmptyCard, fsrs, Rating, type Card, type Grade as FsrsGrade } from 'ts-fsrs'
import type { Direction, DirectionCard, Grade } from './types.ts'

/** Speak stability (days) at which an Expression counts as Learned. */
export const LEARNED_STABILITY_DAYS = 7

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true, enable_short_term: true })

const RATING: Record<Grade, FsrsGrade> = { missed: Rating.Again, hard: Rating.Hard, good: Rating.Good }

export const cardKey = (expressionId: string, direction: Direction) => `${expressionId}:${direction}`

export function newDirectionCard(expressionId: string, direction: Direction, now: number): DirectionCard {
  return fromFsrs(createEmptyCard(new Date(now)), { key: cardKey(expressionId, direction), expressionId, direction })
}

/** Applies one Grade. Sets `learnedAt` the first time a Speak card reaches Learned. */
export function gradeCard(card: DirectionCard, grade: Grade, now: number): DirectionCard {
  const { card: next } = scheduler.next(toFsrs(card), new Date(now), RATING[grade])
  const graded = fromFsrs(next, card)
  if (card.direction === 'speak' && !card.learnedAt && isLearned(graded)) graded.learnedAt = now
  return graded
}

export function isLearned(card: DirectionCard | undefined): boolean {
  return !!card && card.direction === 'speak' && card.stability >= LEARNED_STABILITY_DAYS
}

export const isCorrect = (grade: Grade) => grade !== 'missed'

function toFsrs(c: DirectionCard): Card {
  return {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: 0,
    scheduled_days: c.scheduledDays,
    learning_steps: c.learningSteps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.lastReview ? new Date(c.lastReview) : undefined,
  }
}

function fromFsrs(c: Card, base: Pick<DirectionCard, 'key' | 'expressionId' | 'direction'> & { learnedAt?: number }): DirectionCard {
  return {
    key: base.key,
    expressionId: base.expressionId,
    direction: base.direction,
    due: c.due.getTime(),
    stability: c.stability,
    difficulty: c.difficulty,
    scheduledDays: c.scheduled_days,
    learningSteps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    ...(c.last_review ? { lastReview: c.last_review.getTime() } : {}),
    ...(base.learnedAt ? { learnedAt: base.learnedAt } : {}),
  }
}
