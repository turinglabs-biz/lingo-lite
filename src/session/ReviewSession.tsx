import { useEffect, useMemo, useState } from 'react'
import { illustrationSiblings } from '../../catalog/illustrations.ts'
import { playClip } from '../audio/player.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { seeOptions } from '../domain/choices.ts'
import type { DirectionCard, Grade } from '../domain/types.ts'
import { grade } from '../progress/store.ts'
import { GradeButtons, Prompt, SessionFrame } from './parts.tsx'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

interface QueueItem {
  id: string
  direction: DirectionCard['direction']
  retry: boolean
}

/**
 * Up to 20 due Directions. Speak and Listen are self-graded after reveal; See is a checked choice: pick the
 * Korean that matches the Illustration, then the phrase plays. A Missed card comes back once at the end.
 */
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
  const [revealed, setRevealed] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const item = queue[index]
  const expression = item && expressionById.get(item.id)!

  const options = useMemo(
    () => (item?.direction === 'see' ? seeOptions(expression, catalog, new Set(illustrationSiblings(item.id)), introduced) : []),
    // Recompute only when the card changes, not when Progress updates.
    [item],
  )

  // Listen cards start by playing the Clip; Speak and See stay silent until answered.
  useEffect(() => {
    if (item?.direction === 'listen') playClip(item.id, 'normal')
  }, [item])

  async function record(g: Grade): Promise<QueueItem[]> {
    tracker.countAnswer(g !== 'missed')
    const { becameLearned } = await grade(tracker.sessionId!, item.id, item.direction, g)
    if (becameLearned) tracker.countLearned(item.id)
    const next = g === 'missed' && !item.retry ? [...queue, { ...item, retry: true }] : queue
    setQueue(next)
    return next
  }

  async function advance(next: QueueItem[]) {
    setRevealed(false)
    setPicked(null)
    if (index + 1 < next.length) setIndex(index + 1)
    else onEnd(await tracker.finish())
  }

  function reveal() {
    setRevealed(true)
    if (item.direction === 'speak') playClip(item.id, 'normal')
  }

  async function onGrade(g: Grade) {
    if (!tracker.sessionId) return
    await advance(await record(g))
  }

  async function pick(option: string) {
    if (picked || !tracker.sessionId) return
    setPicked(option)
    playClip(item.id, 'normal')
    await record(option === item.id ? 'good' : 'missed')
  }

  if (!item) return null
  const title = { speak: 'Say it', listen: 'Listen', see: 'See' }[item.direction]
  return (
    <SessionFrame title={title} position={index} total={queue.length} onQuit={() => onEnd(null)}>
      {item.direction === 'speak' && (
        <Prompt label="Say it in Korean">
          <p className="english-prompt">{expression.english}</p>
          {expression.usageNote && <p className="muted small">{expression.usageNote}</p>}
        </Prompt>
      )}
      {item.direction === 'listen' && (
        <Prompt label="What does it mean?">
          <PlayButtons expressionId={item.id} size="large" />
        </Prompt>
      )}

      {item.direction === 'see' ? (
        <>
          <Prompt label="Which one matches the picture?">
            <Illustration expressionId={item.id} size="large" />
          </Prompt>
          <div className="options">
            {options.map((id) => {
              const state = !picked ? '' : id === item.id ? 'right' : id === picked ? 'wrong' : 'dim'
              return (
                <button key={id} type="button" className={`option ${state}`} onClick={() => pick(id)} disabled={!!picked}>
                  <ExpressionView expression={expressionById.get(id)!} size="compact" showEnglish={false} />
                </button>
              )
            })}
          </div>
          {picked && (
            <>
              <div className="answer">
                <ExpressionView expression={expression} />
                <PlayButtons expressionId={item.id} />
              </div>
              <button type="button" className="primary-action" onClick={() => advance(queue)}>
                Next
              </button>
            </>
          )}
        </>
      ) : !revealed ? (
        <button type="button" className="primary-action" onClick={reveal}>
          {item.direction === 'listen' ? 'Think of the meaning, then reveal' : 'Say it aloud, then reveal'}
        </button>
      ) : (
        <>
          <div className="answer">
            <Illustration expressionId={item.id} size="small" />
            <ExpressionView expression={expression} showEnglish={item.direction === 'listen'} />
            {item.direction === 'speak' && <PlayButtons expressionId={item.id} />}
          </div>
          <GradeButtons onGrade={onGrade} />
        </>
      )}
    </SessionFrame>
  )
}
