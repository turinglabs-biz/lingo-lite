import { useEffect, useState } from 'react'
import { playClip } from '../audio/player.ts'
import { expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { EchoBar } from '../echo/EchoMic.tsx'
import { afterSpeakGrade, planLearnSession, type LearnStep } from '../domain/learnPlan.ts'
import { useIgnored } from '../progress/ignored.tsx'
import { grade, introduce, recordCheck, touchSession } from '../progress/store.ts'
import { Prompt, SessionFrame } from './parts.tsx'
import { ListenQuestion, SpeakQuestion } from './questions.tsx'
import { SessionInput } from './sessionInput.ts'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

const TITLE = { expose: 'New', check: 'Listen and pick', speak: 'Say it' }

/** Introduces one Batch: exposure with audio, a listen-and-pick check, then repeated Speak questions. */
export function LearnSession({
  batch,
  introduced,
  onEnd,
}: {
  batch: string[]
  introduced: Set<string>
  onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void
}) {
  const tracker = useSessionTracker('learn')
  const [steps, setSteps] = useState<LearnStep[]>(() => planLearnSession(batch))
  const [index, setIndex] = useState(0)
  // Distractors prefer what the learner has met, including this Batch.
  const [known] = useState(() => new Set([...introduced, ...batch]))
  const ignored = useIgnored()
  const step = steps[index]

  useEffect(() => {
    if (step?.kind === 'expose') {
      introduce(step.id)
      playClip(step.id, 'normal')
    }
  }, [step])

  /** Moves on, skipping every step of an Expression the learner has marked Ignored during the session. */
  async function next() {
    let following = index + 1
    while (following < steps.length && ignored.has(steps[following].id)) following++
    if (following < steps.length) setIndex(following)
    else onEnd(await tracker.finish())
  }

  async function onCheck(correct: boolean) {
    if (!tracker.sessionId) return
    tracker.countAnswer(correct)
    await recordCheck(tracker.sessionId, step.id, correct)
  }

  async function onSpeak(correct: boolean) {
    if (!tracker.sessionId || step.kind !== 'speak') return
    tracker.countAnswer(correct)
    const { becameLearned } = await grade(tracker.sessionId, step.id, 'speak', correct ? 'good' : 'missed')
    if (becameLearned) tracker.countLearned(step.id)
    setSteps((s) => afterSpeakGrade(s, step, !correct))
  }

  if (!step) return null
  const expression = expressionById.get(step.id)!
  const recordInput = () => tracker.sessionId && touchSession(tracker.sessionId)
  return (
    <SessionInput.Provider value={recordInput}>
      <SessionFrame title={TITLE[step.kind]} position={index} total={steps.length} onQuit={() => onEnd(null)}>
        {step.kind === 'expose' && (
          <>
            <Prompt label="New Expression" expressionId={step.id}>
              <Illustration expressionId={step.id} size="large" />
              <ExpressionView expression={expression} />
            </Prompt>
            <PlayButtons expressionId={step.id} size="large" />
            <p className="hint">Listen, then say it out loud.</p>
            <EchoBar key={index} expressionId={step.id} />
            <button type="button" className="primary-action" onClick={next}>
              Next
            </button>
          </>
        )}
        {step.kind === 'check' && (
          <ListenQuestion key={index} expressionId={step.id} introduced={known} onAnswer={onCheck} onNext={next} />
        )}
        {step.kind === 'speak' && <SpeakQuestion key={index} expressionId={step.id} introduced={known} onAnswer={onSpeak} onNext={next} />}
      </SessionFrame>
    </SessionInput.Provider>
  )
}
