import type { ReactNode } from 'react'
import type { Grade } from '../domain/types.ts'

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

export function GradeButtons({ onGrade }: { onGrade: (g: Grade) => void }) {
  return (
    <div className="grades">
      <button type="button" className="grade missed" onClick={() => onGrade('missed')}>
        Missed
      </button>
      <button type="button" className="grade hard" onClick={() => onGrade('hard')}>
        Hard
      </button>
      <button type="button" className="grade good" onClick={() => onGrade('good')}>
        Got it
      </button>
    </div>
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
