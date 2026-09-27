import { createEmptyCard, fsrs, Rating, State, type Card, type Grade as FsrsGrade } from 'ts-fsrs'
import type { Direction, DirectionCard, Grade } from './types.ts'

/** Speak stability (days) at which an Expression counts as Learned. */
export const LEARNED_STABILITY_DAYS = 7

/** Recall each review aims for: normally 90%; for Focus Expressions 95%, so they come up about 2–3× as often. */
export const RETENTION = 0.9
export const FOCUS_RETENTION = 0.95

const DAY_MS = 86_400_000
const scheduler = fsrs({ request_retention: RETENTION, enable_fuzz: true, enable_short_term: true })
const focusScheduler = fsrs({ request_retention: FOCUS_RETENTION, enable_fuzz: true, enable_short_term: true })
/** Without fuzz, for re-dating a card when Focus changes (the same card always gets the same date). */
const intervals = { normal: fsrs({ request_retention: RETENTION }), focus: fsrs({ request_retention: FOCUS_RETENTION }) }

const RATING: Record<Grade, FsrsGrade> = { missed: Rating.Again, good: Rating.Good }

export const cardKey = (expressionId: string, direction: Direction) => `${expressionId}:${direction}`

export function newDirectionCard(expressionId: string, direction: Direction, now: number): DirectionCard {
  return fromFsrs(createEmptyCard(new Date(now)), { key: cardKey(expressionId, direction), expressionId, direction })
}

/**
 * Applies one Grade, aiming for higher recall when the Expression is in Focus. Sets `learnedAt` the first time a Speak
 * card reaches Learned.
 */
export function gradeCard(card: DirectionCard, grade: Grade, now: number, focus = false): DirectionCard {
  const { card: next } = (focus ? focusScheduler : scheduler).next(toFsrs(card), new Date(now), RATING[grade])
  const graded = fromFsrs(next, card)
  if (card.direction === 'speak' && !card.learnedAt && isLearned(graded)) graded.learnedAt = now
  return graded
}

/**
 * Re-dates a card when its Expression enters or leaves Focus: its last review plus the interval for its stability at
 * the new recall target. New cards and cards in (re)learning steps keep their date; their next step is minutes away.
 */
export function refocusCard(card: DirectionCard, focus: boolean): DirectionCard {
  if (card.state !== State.Review || card.lastReview === undefined) return card
  const days = intervals[focus ? 'focus' : 'normal'].next_interval(card.stability, 0)
  return { ...card, due: card.lastReview + days * DAY_MS, scheduledDays: days }
}

/** How likely the card is to be remembered at `now` (0–1); 0 for a card never reviewed. */
export function retrievability(card: DirectionCard, now: number): number {
  return scheduler.get_retrievability(toFsrs(card), new Date(now), false)
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
