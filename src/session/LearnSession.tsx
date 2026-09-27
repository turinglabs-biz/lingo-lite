import { useEffect, useMemo, useState } from 'react'
import { playClip } from '../audio/player.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { afterSpeakGrade, planLearnSession, type LearnStep } from '../domain/learnPlan.ts'
import type { Grade } from '../domain/types.ts'
import { grade, introduce, recordCheck } from '../progress/store.ts'
import { GradeButtons, Prompt, SessionFrame } from './parts.tsx'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

/** Introduces one Batch: exposure with audio, a listen-and-pick check, then repeated Speak attempts. */
export function LearnSession({ batch, onEnd }: { batch: string[]; onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void }) {
  const tracker = useSessionTracker('learn')
  const [steps, setSteps] = useState<LearnStep[]>(() => planLearnSession(batch, catalog.map((e) => e.id)))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const step = steps[index]
  const expression = step && expressionById.get(step.id)!

  // Audio cue for each new step: exposure and the check play the Clip; Speak stays silent until reveal.
  useEffect(() => {
    if (step?.kind === 'expose') {
      introduce(step.id)
      playClip(step.id, 'normal')
    }
    if (step?.kind === 'check') playClip(step.id, 'normal')
  }, [step])

  async function next() {
    setPicked(null)
    setRevealed(false)
    if (index + 1 < steps.length) setIndex(index + 1)
    else onEnd(await tracker.finish())
  }

  async function pick(option: string) {
    if (picked || !tracker.sessionId || step.kind !== 'check') return
    setPicked(option)
    const correct = option === step.id
    tracker.countAnswer(correct)
    await recordCheck(tracker.sessionId, step.id, correct)
  }

  function reveal() {
    setRevealed(true)
    playClip(step.id, 'normal')
  }

  async function onGrade(g: Grade) {
    if (!tracker.sessionId || step.kind !== 'speak') return
    tracker.countAnswer(g !== 'missed')
    const { becameLearned } = await grade(tracker.sessionId, step.id, 'speak', g)
    if (becameLearned) tracker.countLearned(step.id)
    const nextSteps = afterSpeakGrade(steps, step, g === 'missed')
    setSteps(nextSteps)
    setRevealed(false)
    if (index + 1 < nextSteps.length) setIndex(index + 1)
    else onEnd(await tracker.finish())
  }

  const quit = () => onEnd(null)
  const title = useMemo(() => (step?.kind === 'expose' ? 'New' : step?.kind === 'check' ? 'Listen and pick' : 'Say it'), [step])
  if (!step) return null

  return (
    <SessionFrame title={title} position={index} total={steps.length} onQuit={quit}>
      {step.kind === 'expose' && (
        <>
          <Prompt label="New Expression">
            <Illustration expressionId={step.id} size="large" />
            <ExpressionView expression={expression} />
          </Prompt>
          <PlayButtons expressionId={step.id} size="large" />
          <p className="hint">Listen, then say it out loud.</p>
          <button type="button" className="primary-action" onClick={next}>
            Next
          </button>
        </>
      )}

      {step.kind === 'check' && (
        <>
          <Prompt label="What does it mean?">
            <PlayButtons expressionId={step.id} size="large" />
          </Prompt>
          <div className="options">
            {step.options.map((id) => {
              const state = !picked ? '' : id === step.id ? 'right' : id === picked ? 'wrong' : 'dim'
              return (
                <button key={id} type="button" className={`option ${state}`} onClick={() => pick(id)} disabled={!!picked}>
                  {expressionById.get(id)!.english}
                </button>
              )
            })}
          </div>
          {picked && (
            <>
              <ExpressionView expression={expression} size="compact" showEnglish={false} />
              <button type="button" className="primary-action" onClick={next}>
                Next
              </button>
            </>
          )}
        </>
      )}

      {step.kind === 'speak' && (
        <>
          <Prompt label="Say it in Korean">
            <p className="english-prompt">{expression.english}</p>
            {expression.usageNote && <p className="muted small">{expression.usageNote}</p>}
          </Prompt>
          {!revealed ? (
            <button type="button" className="primary-action" onClick={reveal}>
              Say it aloud, then reveal
            </button>
          ) : (
            <>
              <div className="answer">
                <Illustration expressionId={step.id} size="small" />
                <ExpressionView expression={expression} showEnglish={false} />
                <PlayButtons expressionId={step.id} />
              </div>
              <GradeButtons onGrade={onGrade} />
            </>
          )}
        </>
      )}
    </SessionFrame>
  )
}
