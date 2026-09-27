import { catalog, expressionById, topics } from '../catalog/index.ts'
import { db } from '../db.ts'
import { computeStars, earnedStars, withInput } from '../domain/progress.ts'
import { cardKey, gradeCard, isCorrect, newDirectionCard, refocusCard } from '../domain/scheduler.ts'
import type { Direction, Grade, Session, SessionType } from '../domain/types.ts'

// Writes to Progress. Everything is keyed by Expression id, so Catalog edits keep Progress.

export async function startSession(type: SessionType): Promise<Session> {
  const now = Date.now()
  const session: Session = { id: crypto.randomUUID(), type, startedAt: now, practiceMs: 0, lastInputAt: now }
  await db.sessions.put(session)
  return session
}

/** Records learner input for Practice time. */
export async function touchSession(sessionId: string) {
  const session = await db.sessions.get(sessionId)
  if (session) await db.sessions.put(withInput(session, Date.now()))
}

export async function finishSession(sessionId: string) {
  const session = await db.sessions.get(sessionId)
  if (!session || session.endedAt) return
  const now = Date.now()
  await db.sessions.put({ ...withInput(session, now), endedAt: now })
}

/** First exposure: the Expression now counts as introduced and its Speak Direction enters the schedule. */
export async function introduce(expressionId: string) {
  const now = Date.now()
  await db.transaction('rw', db.introductions, db.cards, db.stars, async () => {
    if (await db.introductions.get(expressionId)) return
    await db.introductions.put({ expressionId, at: now })
    await db.cards.put(newDirectionCard(expressionId, 'speak', now))
    await updateStars(expressionById.get(expressionId)?.topic)
  })
}

/** The listen-and-pick check in a Learn session. It is recorded as an answer but does not touch the schedule. */
export async function recordCheck(sessionId: string, expressionId: string, correct: boolean) {
  await db.answers.add({ at: Date.now(), sessionId, expressionId, kind: 'check', correct })
  await touchSession(sessionId)
}

export interface GradeResult {
  /** The Expression became Learned for the first time with this answer. */
  becameLearned: boolean
}

/** Grades one Direction. The first correct Speak answer unlocks Listen and See. */
export async function grade(sessionId: string, expressionId: string, direction: Direction, g: Grade): Promise<GradeResult> {
  const now = Date.now()
  let becameLearned = false
  await db.transaction('rw', [db.cards, db.answers, db.stars, db.sessions, db.focus], async () => {
    const key = cardKey(expressionId, direction)
    const card = (await db.cards.get(key)) ?? newDirectionCard(expressionId, direction, now)
    const next = gradeCard(card, g, now, !!(await db.focus.get(expressionId)))
    becameLearned = !card.learnedAt && !!next.learnedAt
    await db.cards.put(next)
    await db.answers.add({ at: now, sessionId, expressionId, kind: direction, correct: isCorrect(g), grade: g })
    if (direction === 'speak' && isCorrect(g)) {
      for (const unlocked of ['listen', 'see'] as const) {
        if (!(await db.cards.get(cardKey(expressionId, unlocked)))) await db.cards.put(newDirectionCard(expressionId, unlocked, now))
      }
    }
    if (becameLearned) await updateStars(expressionById.get(expressionId)?.topic)
    const session = await db.sessions.get(sessionId)
    if (session) await db.sessions.put(withInput(session, now))
  })
  return { becameLearned }
}

async function updateStars(topic: string | undefined) {
  if (!topic) return
  const ids = catalog.filter((e) => e.topic === topic).map((e) => e.id)
  const introduced = new Set((await db.introductions.where('expressionId').anyOf(ids).toArray()).map((i) => i.expressionId))
  const speak = await db.cards.bulkGet(ids.map((id) => cardKey(id, 'speak')))
  const speakCards = new Map(speak.filter((c) => !!c).map((c) => [c.expressionId, c]))
  const previous = (await db.stars.get(topic))?.stars ?? 0
  const stars = earnedStars(previous, computeStars(ids, introduced, speakCards))
  if (stars !== previous) await db.stars.put({ topic, stars })
}

/** Puts an Expression in Focus or takes it out, re-dating its Directions for the new recall target right away. */
export async function setFocus(expressionId: string, on: boolean) {
  await db.transaction('rw', [db.focus, db.cards], async () => {
    if (on) await db.focus.put({ expressionId, at: Date.now() })
    else await db.focus.delete(expressionId)
    const cards = await db.cards.where('expressionId').equals(expressionId).toArray()
    await db.cards.bulkPut(cards.map((c) => refocusCard(c, on)))
  })
}

export async function resetProgress() {
  await db.transaction('rw', [db.introductions, db.cards, db.answers, db.sessions, db.stars, db.focus], async () => {
    await Promise.all([db.introductions.clear(), db.cards.clear(), db.answers.clear(), db.sessions.clear(), db.stars.clear(), db.focus.clear()])
  })
}

export const allTopicIds = topics.map((t) => t.id)
