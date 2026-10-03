import Dexie, { type EntityTable } from 'dexie'
import { cardKey, newDirectionCard } from './domain/scheduler.ts'
import type { Answer, DirectionCard, FocusMark, IgnoredMark, Introduction, Session, TopicStars } from './domain/types.ts'

/** Learner settings, part of Progress. */
export interface Settings {
  id: 'settings'
  hangulFirst: boolean
  /** Echo in the main flow (turned on in Settings, after downloading the model and allowing the mic). */
  echo?: boolean
}

export const defaultSettings: Settings = { id: 'settings', hangulFirst: false, echo: false }

/** Everything the app remembers about the learner (Progress). Device-only; losing it is accepted. */
export const db = new Dexie('lingo-lite') as Dexie & {
  settings: EntityTable<Settings, 'id'>
  introductions: EntityTable<Introduction, 'expressionId'>
  cards: EntityTable<DirectionCard, 'key'>
  answers: EntityTable<Answer, 'id'>
  sessions: EntityTable<Session, 'id'>
  stars: EntityTable<TopicStars, 'topic'>
  focus: EntityTable<FocusMark, 'expressionId'>
  ignored: EntityTable<IgnoredMark, 'expressionId'>
}

db.version(1).stores({
  settings: 'id',
})

db.version(2).stores({
  settings: 'id',
  introductions: 'expressionId, at',
  cards: 'key, expressionId, due',
  answers: '++id, at, sessionId, expressionId',
  sessions: 'id, startedAt',
  stars: 'topic',
})

// v3: the See Direction. Expressions that already unlocked Listen get See too.
db.version(3)
  .stores({})
  .upgrade(async (tx) => {
    const cards = tx.table<DirectionCard, string>('cards')
    const now = Date.now()
    const listen = await cards.filter((c) => c.direction === 'listen').toArray()
    for (const c of listen) {
      const key = cardKey(c.expressionId, 'see')
      if (!(await cards.get(key))) await cards.put(newDirectionCard(c.expressionId, 'see', now))
    }
  })

// v4: Focus. A new table; nothing else changes.
db.version(4).stores({
  focus: 'expressionId, at',
})

// v5: Ignored. A new table; nothing else changes.
db.version(5).stores({
  ignored: 'expressionId, at',
})
