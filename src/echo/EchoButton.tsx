import type { ReactNode } from 'react'
import type { EchoState } from './useEcho.ts'

const LABEL: Record<EchoState['phase'], string> = {
  idle: 'Hold to echo',
  starting: 'Wait…',
  listening: 'Listening… let go when done',
  scoring: 'Scoring…',
  done: 'Hold to echo again',
  error: 'Hold to echo again',
}

const MIC = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/** What a round mic button shows: the mic, or the latest Echo score in its place. */
function roundContent(state: EchoState): ReactNode {
  if (state.phase === 'scoring' || state.phase === 'starting') return '…'
  if (state.phase === 'done') return state.attempt.result.kind === 'heard' ? `${state.attempt.result.score}%` : '?'
  if (state.phase === 'error') return '!'
  return MIC
}

/**
 * Hold-to-talk mic button: recording runs while it is held (pointer, or Space/Enter from the keyboard). The bar is a
 * full-width button with a label; the round one sits next to the play buttons and shows the score in place of the mic.
 */
export function EchoButton({
  state,
  disabled,
  onBegin,
  onEnd,
  variant = 'bar',
}: {
  state: EchoState
  disabled?: boolean
  onBegin: () => void
  onEnd: () => void
  variant?: 'bar' | 'round'
}) {
  const busy = state.phase === 'scoring'
  return (
    <button
      type="button"
      className={`echo-button ${variant} ${state.phase}`}
      disabled={disabled || busy}
      aria-label={variant === 'round' ? `${LABEL[state.phase]}${echoText(state) ? ` · ${echoText(state)}` : ''}` : undefined}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        onBegin()
      }}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          onBegin()
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') onEnd()
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {variant === 'round' ? (
        roundContent(state)
      ) : (
        <>
          {MIC}
          {LABEL[state.phase]}
        </>
      )}
    </button>
  )
}

/** The latest result in words, or null before the first Echo. */
function echoText(state: EchoState): string | null {
  if (state.phase === 'error') return `Scoring failed: ${state.message}`
  if (state.phase !== 'done') return null
  const { result } = state.attempt
  return result.kind === 'heard' ? `${result.score}%` : "Didn't catch that, try again"
}

/** The latest Echo score, or why there is none. */
export function EchoScore({ state }: { state: EchoState }) {
  const text = echoText(state)
  if (!text) return null
  const heard = state.phase === 'done' && state.attempt.result.kind === 'heard'
  return <p className={`echo-score ${heard ? '' : 'missed'}`}>{heard ? <b>{text}</b> : text}</p>
}
