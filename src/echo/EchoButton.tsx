import type { EchoState } from './useEcho.ts'

const LABEL: Record<EchoState['phase'], string> = {
  idle: 'Hold to echo',
  starting: 'Wait…',
  listening: 'Listening… let go when done',
  scoring: 'Scoring…',
  done: 'Hold to echo again',
  error: 'Hold to echo again',
}

/** Hold-to-talk mic button: recording runs while it is held (pointer, or Space/Enter from the keyboard). */
export function EchoButton({ state, disabled, onBegin, onEnd }: { state: EchoState; disabled?: boolean; onBegin: () => void; onEnd: () => void }) {
  const busy = state.phase === 'scoring'
  return (
    <button
      type="button"
      className={`echo-button ${state.phase}`}
      disabled={disabled || busy}
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
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {LABEL[state.phase]}
    </button>
  )
}

/** The latest Echo score, or why there is none. */
export function EchoScore({ state }: { state: EchoState }) {
  if (state.phase === 'error') return <p className="echo-score missed">Scoring failed: {state.message}</p>
  if (state.phase !== 'done') return null
  const { result } = state.attempt
  if (result.kind === 'not-heard') return <p className="echo-score missed">Didn't catch that, try again</p>
  return (
    <p className="echo-score">
      <b>{result.score}%</b>
    </p>
  )
}
