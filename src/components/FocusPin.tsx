import { setFocus } from '../progress/store.ts'
import { useFocus } from '../progress/focus.tsx'

/** Puts an Expression in Focus or takes it out. A pin, never a star: Stars belong to Topics. */
export function FocusPin({ expressionId }: { expressionId: string }) {
  const on = useFocus().has(expressionId)
  return (
    <button
      type="button"
      className={`focus-pin ${on ? 'on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'In Focus (tap to take it out)' : 'Put in Focus'}
      title={on ? 'In Focus' : 'Put in Focus'}
      onClick={(e) => {
        e.stopPropagation()
        setFocus(expressionId, !on)
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.5 3.5h5v5.5l3 3v1.5h-11V12l3-3z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 13.5v7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
