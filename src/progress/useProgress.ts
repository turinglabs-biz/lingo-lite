import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { catalog } from '../catalog/index.ts'
import { db } from '../db.ts'
import { dueCards, nextBatch, streaks, totalXp } from '../domain/progress.ts'
import { isLearned } from '../domain/scheduler.ts'
import type { Answer, DirectionCard, Session } from '../domain/types.ts'

export interface Progress {
  introduced: Set<string>
  /** Focus Expressions, in the order they were put in Focus. */
  focus: Set<string>
  cards: DirectionCard[]
  speakCards: Map<string, DirectionCard>
  learned: Set<string>
  answers: Answer[]
  sessions: Session[]
  stars: Map<string, number>
  dueCount: number
  nextBatchSize: number
  xp: number
  streak: { current: number; longest: number }
}

/** Re-evaluates "now" every minute so due counts and Streak stay fresh while the app is open. */
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    const onVisible = () => document.visibilityState === 'visible' && setNow(Date.now())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return now
}

/** Live summary of Progress. Undefined while loading. */
export function useProgress(): Progress | undefined {
  const now = useNow()
  const raw = useLiveQuery(async () => {
    const [introductions, cards, answers, sessions, stars, focus] = await Promise.all([
      db.introductions.toArray(),
      db.cards.toArray(),
      db.answers.toArray(),
      db.sessions.toArray(),
      db.stars.toArray(),
      db.focus.orderBy('at').toArray(),
    ])
    return { introductions, cards, answers, sessions, stars, focus }
  }, [])
  if (!raw) return undefined

  // Ignore Progress for Expressions that are no longer in the Catalog.
  const known = new Set(catalog.map((e) => e.id))
  const cards = raw.cards.filter((c) => known.has(c.expressionId))
  const introduced = new Set(raw.introductions.map((i) => i.expressionId).filter((id) => known.has(id)))
  const focus = new Set(raw.focus.map((f) => f.expressionId).filter((id) => known.has(id)))
  const speakCards = new Map(cards.filter((c) => c.direction === 'speak').map((c) => [c.expressionId, c]))
  return {
    introduced,
    focus,
    cards,
    speakCards,
    learned: new Set([...speakCards.values()].filter(isLearned).map((c) => c.expressionId)),
    answers: raw.answers,
    sessions: raw.sessions,
    stars: new Map(raw.stars.map((s) => [s.topic, s.stars])),
    dueCount: dueCards(cards, now).length,
    nextBatchSize: nextBatch(catalog, introduced, focus).length,
    xp: totalXp(raw.answers, cards, raw.sessions),
    streak: streaks(raw.sessions, now),
  }
}
