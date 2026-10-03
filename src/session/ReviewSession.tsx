import { useState } from 'react'
import type { DirectionCard } from '../domain/types.ts'
import { useIgnored } from '../progress/ignored.tsx'
import { grade, touchSession } from '../progress/store.ts'
import { SessionFrame } from './parts.tsx'
import { ListenQuestion, SeeQuestion, SpeakQuestion } from './questions.tsx'
import { SessionInput } from './sessionInput.ts'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

interface QueueItem {
  id: string
  direction: DirectionCard['direction']
  retry: boolean
}

const QUESTION = { speak: SpeakQuestion, listen: ListenQuestion, see: SeeQuestion }
const TITLE = { speak: 'Say it', listen: 'Listen', see: 'See' }

/**
 * A Review session (up to 20 due Directions) or a Focus session (up to 20 Directions of Focus Expressions, due or not):
 * each a checked question, graded into the schedule. A Missed card comes back once at the end.
 */
export function ReviewSession({
  cards,
  type = 'review',
  introduced,
  onEnd,
}: {
  cards: DirectionCard[]
  type?: 'review' | 'focus'
  introduced: Set<string>
  onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void
}) {
  const tracker = useSessionTracker(type)
  const [queue, setQueue] = useState<QueueItem[]>(() => cards.map((c) => ({ id: c.expressionId, direction: c.direction, retry: false })))
  const [index, setIndex] = useState(0)
  const ignored = useIgnored()
  const item = queue[index]

  async function onAnswer(correct: boolean) {
    if (!tracker.sessionId) return
    tracker.countAnswer(correct)
    const { becameLearned } = await grade(tracker.sessionId, item.id, item.direction, correct ? 'good' : 'missed')
    if (becameLearned) tracker.countLearned(item.id)
    if (!correct && !item.retry) setQueue((q) => [...q, { ...item, retry: true }])
  }

  /** Moves on, skipping anything the learner has marked Ignored since the session started. */
  async function onNext() {
    let next = index + 1
    while (next < queue.length && ignored.has(queue[next].id)) next++
    if (next < queue.length) setIndex(next)
    else onEnd(await tracker.finish())
  }

  if (!item) return null
  const Question = QUESTION[item.direction]
  return (
    <SessionInput.Provider value={() => tracker.sessionId && touchSession(tracker.sessionId)}>
      <SessionFrame title={TITLE[item.direction]} position={index} total={queue.length} onQuit={() => onEnd(null)}>
        <Question key={index} expressionId={item.id} introduced={introduced} onAnswer={onAnswer} onNext={onNext} />
      </SessionFrame>
    </SessionInput.Provider>
  )
}
