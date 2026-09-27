import { useState } from 'react'
import type { DirectionCard } from '../domain/types.ts'
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

/** Up to 20 due Directions, each a checked question. A Missed card comes back once at the end. */
export function ReviewSession({
  due,
  introduced,
  onEnd,
}: {
  due: DirectionCard[]
  introduced: Set<string>
  onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void
}) {
  const tracker = useSessionTracker('review')
  const [queue, setQueue] = useState<QueueItem[]>(() => due.map((c) => ({ id: c.expressionId, direction: c.direction, retry: false })))
  const [index, setIndex] = useState(0)
  const item = queue[index]

  async function onAnswer(correct: boolean) {
    if (!tracker.sessionId) return
    tracker.countAnswer(correct)
    const { becameLearned } = await grade(tracker.sessionId, item.id, item.direction, correct ? 'good' : 'missed')
    if (becameLearned) tracker.countLearned(item.id)
    if (!correct && !item.retry) setQueue((q) => [...q, { ...item, retry: true }])
  }

  async function onNext() {
    if (index + 1 < queue.length) setIndex(index + 1)
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
