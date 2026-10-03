import { setIgnored } from '../progress/store.ts'
import { useIgnored } from '../progress/ignored.tsx'

/**
 * Marks an Expression Ignored, or stops ignoring it. Quiet on purpose: it sits beside the Focus pin, in gray, and an
 * Ignored Expression is only dimmed where it still shows (the Phrasebook), never removed.
 */
export function IgnoreToggle({ expressionId }: { expressionId: string }) {
  const on = useIgnored().has(expressionId)
  return (
    <button
      type="button"
      className={`ignore-toggle ${on ? 'on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Ignored (tap to practise it again)' : 'Ignore (never practise it)'}
      title={on ? 'Ignored' : 'Ignore'}
      onClick={(e) => {
        e.stopPropagation()
        setIgnored(expressionId, !on)
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.7 17.3L17.3 6.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
