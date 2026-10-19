import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { catalog } from '../catalog/index.ts'
import { db } from '../db.ts'
import { cardsWithoutIgnored, dueCards, nextBatch, streaks, totalXp, withoutIgnored } from '../domain/progress.ts'
import { learnedDirection, scheduledCards } from '../domain/directions.ts'
import { isLearned } from '../domain/scheduler.ts'
import type { Answer, ConversationCard, DirectionCard, Session } from '../domain/types.ts'

export interface Progress {
  introduced: Set<string>
  /** Focus Expressions, in the order they were put in Focus. */
  focus: Set<string>
  /** Ignored Expressions: never introduced, reviewed or practised, and left out of counts and Stars. */
  ignored: Set<string>
  /** The Catalog without Ignored Expressions — what Batches and counts are built from. */
  practiceCatalog: typeof catalog
  /** Direction cards without those of Ignored Expressions — what sessions are built from. */
  practiceCards: DirectionCard[]
  cards: DirectionCard[]
  /** Each Expression's card that decides Learned: Speak, or Listen for a Heard Expression. */
  learnedCards: Map<string, DirectionCard>
  learned: Set<string>
  answers: Answer[]
  sessions: Session[]
  stars: Map<string, number>
  dueCount: number
  nextBatchSize: number
  xp: number
  streak: { current: number; longest: number }
  /** Each Conversation's own schedule, once it has one. */
  conversationCards: Map<string, ConversationCard>
  /** How many Conversations are due. */
  dueConversations: number
  now: number
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
    const [introductions, cards, answers, sessions, stars, focus, ignored, conversationCards] = await Promise.all([
      db.introductions.toArray(),
      db.cards.toArray(),
      db.answers.toArray(),
      db.sessions.toArray(),
      db.stars.toArray(),
      db.focus.orderBy('at').toArray(),
      db.ignored.toArray(),
      db.conversationCards.toArray(),
    ])
    return { introductions, cards, answers, sessions, stars, focus, ignored, conversationCards }
  }, [])
  if (!raw) return undefined

  // Ignore Progress for Expressions that are no longer in the Catalog.
  const known = new Set(catalog.map((e) => e.id))
  const heard = new Set(catalog.filter((e) => e.heard).map((e) => e.id))
  // A Heard Expression's Speak and See cards (from before it became Heard) are kept but never scheduled or counted.
  const cards = scheduledCards(
    raw.cards.filter((c) => known.has(c.expressionId)),
    heard,
  )
  const introduced = new Set(raw.introductions.map((i) => i.expressionId).filter((id) => known.has(id)))
  const focus = new Set(raw.focus.map((f) => f.expressionId).filter((id) => known.has(id)))
  const ignored = new Set(raw.ignored.map((m) => m.expressionId).filter((id) => known.has(id)))
  const practiceCatalog = withoutIgnored(catalog, ignored)
  const practiceCards = cardsWithoutIgnored(cards, ignored)
  // Each Expression's deciding card for Learned: Speak, or Listen for a Heard Expression.
  const learnedCards = new Map(
    cards.filter((c) => c.direction === learnedDirection({ heard: heard.has(c.expressionId) })).map((c) => [c.expressionId, c]),
  )
  return {
    introduced,
    focus,
    ignored,
    practiceCatalog,
    practiceCards,
    cards,
    learnedCards,
    learned: new Set([...learnedCards.values()].filter((c) => isLearned(c, c.direction)).map((c) => c.expressionId)),
    answers: raw.answers,
    sessions: raw.sessions,
    stars: new Map(raw.stars.map((s) => [s.topic, s.stars])),
    dueCount: dueCards(practiceCards, now).length,
    nextBatchSize: nextBatch(practiceCatalog, introduced, focus).length,
    // XP counts every card ever Learned, including those a Heard Expression no longer schedules.
    xp: totalXp(raw.answers, raw.cards, raw.sessions),
    streak: streaks(raw.sessions, now),
    conversationCards: new Map(raw.conversationCards.map((c) => [c.conversationId, c])),
    dueConversations: raw.conversationCards.filter((c) => c.due <= now).length,
    now,
  }
}
