import type { Answer, DirectionCard, Session } from './types.ts'
import { isLearned } from './scheduler.ts'

export const BATCH_SIZE = 15
export const REVIEW_SESSION_SIZE = 20
export const BACKLOG_WARNING = 50
export const IDLE_GAP_MS = 60_000

export const XP = { answer: 1, learned: 2, session: 5 } as const

/** The next Batch: the first Expressions in Catalog order that were never introduced. */
export function nextBatch<T extends { id: string }>(ordered: T[], introduced: Set<string>, size = BATCH_SIZE): T[] {
  return ordered.filter((e) => !introduced.has(e.id)).slice(0, size)
}

/** Due Directions, most overdue first. */
export function dueCards(cards: DirectionCard[], now: number, limit = Infinity): DirectionCard[] {
  return cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due).slice(0, limit)
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
