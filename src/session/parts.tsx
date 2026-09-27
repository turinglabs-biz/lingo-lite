import type { ReactNode } from 'react'

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

export function Prompt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="prompt">
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  )
}
