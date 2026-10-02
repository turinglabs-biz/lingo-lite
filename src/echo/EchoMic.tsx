// Echo in the main flow: a hold-to-talk mic wherever the learner can say an Expression, after hearing it or from memory
// on a Speak question. Hidden while Echo is off in Settings. It never changes a Grade or XP; in a session it counts as input for Practice time.
import { useContext } from 'react'
import { SessionInput } from '../session/sessionInput.ts'
import { EchoButton, EchoScore } from './EchoButton.tsx'
import { useEchoStatus } from './EchoProvider.tsx'
import { useEcho } from './useEcho.ts'

function useMainFlowEcho(expressionId: string) {
  const status = useEchoStatus()
  const recordInput = useContext(SessionInput)
  const echo = useEcho(expressionId, status.kind === 'ready' ? status.model : null, () => recordInput?.())
  return { status, echo }
}

/**
 * A full-width mic with the score below it: at first exposure and after an answer (say it back after the Clip), and on
 * a Speak question before answering (say it from memory to check yourself).
 */
export function EchoBar({ expressionId, hint = 'Say it back to see how close you were' }: { expressionId: string; hint?: string }) {
  const { status, echo } = useMainFlowEcho(expressionId)
  if (status.kind === 'off') return null
  return (
    <div className="echo-bar">
      <EchoButton state={echo.state} disabled={status.kind !== 'ready'} onBegin={echo.begin} onEnd={echo.end} />
      <EchoScore state={echo.state} hint={hint} />
    </div>
  )
}

/** A round mic next to the play buttons, showing the score in its place: the Phrasebook list. */
export function EchoRound({ expressionId }: { expressionId: string }) {
  const { status, echo } = useMainFlowEcho(expressionId)
  if (status.kind === 'off') return null
  return <EchoButton variant="round" state={echo.state} disabled={status.kind !== 'ready'} onBegin={echo.begin} onEnd={echo.end} />
}
