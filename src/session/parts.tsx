import type { ReactNode } from 'react'
import { FocusPin } from '../components/FocusPin.tsx'

export function SessionFrame({ title, position, total, onQuit, children }: { title: string; position: number; total: number; onQuit: () => void; children: ReactNode }) {
  return (
    <section className="session">
      <header className="session-head">
        <button type="button" className="quit" onClick={onQuit} aria-label="End session">
          ✕
        </button>
        <div className="session-progress" aria-label={`${position} of ${total}`}>
          <i style={{ width: `${Math.min(100, (position / Math.max(total, 1)) * 100)}%` }} />
        </div>
        <span className="session-title">{title}</span>
      </header>
      <div className="session-body">{children}</div>
    </section>
  )
}

/** A question's or exposure's prompt, with the Focus pin for its Expression (usable before and after answering). */
export function Prompt({ label, expressionId, children }: { label: string; expressionId?: string; children: ReactNode }) {
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span className="eyebrow">{label}</span>
        {expressionId && <FocusPin expressionId={expressionId} />}
      </div>
      {children}
    </div>
  )
}
