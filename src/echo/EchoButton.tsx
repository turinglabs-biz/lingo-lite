import type { ReactNode } from 'react'
import { lastAttempt, type EchoState } from './useEcho.ts'

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
  const attempt = lastAttempt(state)
  if (!attempt) return null
  return attempt.result.kind === 'heard' ? `${attempt.result.score}%` : "Didn't catch that, try again"
}

/**
 * The line under the Echo button: a hint before the first Echo, then the latest score. It keeps the same height
 * throughout, and a new Echo leaves the previous score in place (dimmed) until its own is ready, so nothing on the
 * screen shifts while the learner holds the button.
 */
export function EchoScore({ state, hint }: { state: EchoState; hint?: string }) {
  const text = echoText(state)
  const attempt = lastAttempt(state)
  const heard = state.phase !== 'error' && attempt?.result.kind === 'heard'
  const busy = state.phase === 'starting' || state.phase === 'listening' || state.phase === 'scoring'
  const kind = !text ? 'hint' : heard ? '' : 'missed'
  return (
    <p className={`echo-score ${kind} ${busy ? 'busy' : ''}`} aria-live="polite">
      {text ? heard ? <b>{text}</b> : text : hint}
    </p>
  )
}
