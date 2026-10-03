import { MAX_NUMBERS_PER_BATCH } from '../catalog/order.ts'
import type { Answer, DirectionCard, Session } from './types.ts'
import { shuffle } from './choices.ts'
import { isLearned, retrievability } from './scheduler.ts'

export const BATCH_SIZE = 15
/** At most this many not-yet-introduced Focus Expressions join a Batch, picked at random. */
export const FOCUS_PER_BATCH = 5
export const REVIEW_SESSION_SIZE = 20
export const BACKLOG_WARNING = 50
export const IDLE_GAP_MS = 60_000

export const XP = { answer: 1, learned: 2, session: 5 } as const

/**
 * The next Batch: up to FOCUS_PER_BATCH never-introduced Focus Expressions picked at random, then the first
 * never-introduced Expressions in Catalog order, with at most MAX_NUMBERS_PER_BATCH Numbers Expressions in all. The
 * Batch keeps Catalog order.
 */
export function nextBatch<T extends { id: string; topic: string }>(
  ordered: T[],
  introduced: Set<string>,
  focus: Set<string> = new Set(),
  random = Math.random,
  size = BATCH_SIZE,
): T[] {
  const fresh = ordered.filter((e) => !introduced.has(e.id))
  const chosen = new Set<T>()
  let numbers = 0
  const take = (e: T) => {
    if (e.topic === 'numbers') {
      if (numbers >= MAX_NUMBERS_PER_BATCH) return false
      numbers++
    }
    chosen.add(e)
    return true
  }
  let picked = 0
  for (const e of shuffle(fresh.filter((e) => focus.has(e.id)), random)) {
    if (picked >= Math.min(FOCUS_PER_BATCH, size)) break
    if (take(e)) picked++
  }
  for (const e of fresh) {
    if (chosen.size >= size) break
    if (!chosen.has(e)) take(e)
  }
  return fresh.filter((e) => chosen.has(e))
}

/**
 * What practice is built from: the Catalog without Ignored Expressions. Ignored ones keep their Progress (so taking
 * the mark off restores them), but are never introduced, reviewed, practised or offered as an option.
 */
export function withoutIgnored<T extends { id: string }>(items: T[], ignored: Set<string>): T[] {
  return ignored.size ? items.filter((e) => !ignored.has(e.id)) : items
}

/** The Direction cards practice is built from: those of Expressions that aren't Ignored. */
export function cardsWithoutIgnored(cards: DirectionCard[], ignored: Set<string>): DirectionCard[] {
  return ignored.size ? cards.filter((c) => !ignored.has(c.expressionId)) : cards
}

/** Due Directions, those of Focus Expressions first, each group most overdue first. */
export function dueCards(cards: DirectionCard[], now: number, limit = Infinity, focus: Set<string> = new Set()): DirectionCard[] {
  const due = cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due)
  return [...due.filter((c) => focus.has(c.expressionId)), ...due.filter((c) => !focus.has(c.expressionId))].slice(0, limit)
}

/**
 * A Focus session: the Directions of Focus Expressions (only those that exist, so introduced and unlocked), due or
 * not, least likely to be remembered right now first.
 */
export function focusQueue(cards: DirectionCard[], focus: Set<string>, now: number, limit = REVIEW_SESSION_SIZE): DirectionCard[] {
  return cards
    .filter((c) => focus.has(c.expressionId))
    .map((c) => ({ c, r: retrievability(c, now) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map(({ c }) => c)
}

/** Stars a Topic has earned right now (before applying "never drops"). */
export function computeStars(topicIds: string[], introduced: Set<string>, speakCards: Map<string, DirectionCard>): number {
  if (topicIds.length === 0) return 0
  const learned = topicIds.filter((id) => isLearned(speakCards.get(id))).length / topicIds.length
  if (learned >= 1) return 3
  if (learned >= 0.8) return 2
  return topicIds.every((id) => introduced.has(id)) ? 1 : 0
}

/** Stars never drop once earned. */
export const earnedStars = (previous: number, current: number) => Math.max(previous, current)

export function totalXp(answers: Answer[], cards: DirectionCard[], sessions: Session[]): number {
  return (
    answers.length * XP.answer +
    cards.filter((c) => c.learnedAt).length * XP.learned +
    sessions.filter((s) => s.endedAt).length * XP.session
  )
}

/** Local calendar day, e.g. "2026-09-27". */
export function dayKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d - 1, 12).getTime())
}

/** Current and longest runs of consecutive days with at least one finished session. The current Streak survives
 * until the end of the day after the last active one. */
export function streaks(sessions: Session[], now: number): { current: number; longest: number } {
  const days = new Set(sessions.filter((s) => s.endedAt).map((s) => dayKey(s.endedAt!)))
  let longest = 0
  for (const day of days) {
    if (days.has(previousDay(day))) continue
    let run = 1
    let next = day
    // Walk forward from the start of each run.
    for (;;) {
      const [y, m, d] = next.split('-').map(Number)
      const following = dayKey(new Date(y, m - 1, d + 1, 12).getTime())
      if (!days.has(following)) break
      run++
      next = following
    }
    longest = Math.max(longest, run)
  }
  let day = dayKey(now)
  if (!days.has(day)) day = previousDay(day)
  let current = 0
  while (days.has(day)) {
    current++
    day = previousDay(day)
  }
  return { current, longest }
}

/** Adds the time since the last input to a session's Practice time, ignoring gaps longer than IDLE_GAP_MS. */
export function withInput(session: Session, now: number): Session {
  const gap = now - session.lastInputAt
  return { ...session, practiceMs: session.practiceMs + (gap > 0 && gap <= IDLE_GAP_MS ? gap : 0), lastInputAt: now }
}

export interface AccuracyStats {
  answers: number
  correct: number
}

export function accuracyBy(answers: Answer[]): Record<Answer['kind'], AccuracyStats> {
  const out = {
    speak: { answers: 0, correct: 0 },
    listen: { answers: 0, correct: 0 },
    see: { answers: 0, correct: 0 },
    check: { answers: 0, correct: 0 },
  }
  for (const a of answers) {
    out[a.kind].answers++
    if (a.correct) out[a.kind].correct++
  }
  return out
}
