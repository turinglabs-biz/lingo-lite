import { topics } from '../catalog/index.ts'
import { accuracyBy, dayKey } from '../domain/progress.ts'
import type { Progress } from '../progress/useProgress.ts'
import { Stars } from './Topics.tsx'

const WEEKS = 12

function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

const pct = (a: { answers: number; correct: number }) => (a.answers ? `${Math.round((a.correct / a.answers) * 100)}%` : '—')

export function Stats({ progress }: { progress: Progress }) {
  const { answers, sessions, streak, xp, introduced, learned, ignored, practiceCatalog } = progress
  // Ignored Expressions are left out of the Expression counts (their past answers still count above).
  const introducedCount = [...introduced].filter((id) => !ignored.has(id)).length
  const learnedCount = [...learned].filter((id) => !ignored.has(id)).length
  const acc = accuracyBy(answers)
  const correct = answers.filter((a) => a.correct).length
  const practiceMs = sessions.reduce((sum, s) => sum + s.practiceMs, 0)

  // Heatmap: answers per local day, last WEEKS weeks, columns = weeks (Monday first).
  const perDay = new Map<string, number>()
  for (const a of answers) perDay.set(dayKey(a.at), (perDay.get(dayKey(a.at)) ?? 0) + 1)
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) - (WEEKS - 1) * 7, 12)
  const todayKey = dayKey(today.getTime())
  const max = Math.max(1, ...perDay.values())
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12)
    const key = dayKey(d.getTime())
    const count = perDay.get(key) ?? 0
    return { key, count, future: key > todayKey, level: count === 0 ? 0 : Math.ceil((count / max) * 4) }
  })

  return (
    <section className="screen">
      <h1>Stats</h1>
      <div className="stat-grid">
        <div>
          <b>{answers.length}</b>
          <span>answers</span>
        </div>
        <div>
          <b>{correct}</b>
          <span>correct</span>
        </div>
        <div>
          <b>{formatDuration(practiceMs)}</b>
          <span>practice time</span>
        </div>
        <div>
          <b>{streak.current}</b>
          <span>day streak</span>
        </div>
        <div>
          <b>{streak.longest}</b>
          <span>longest streak</span>
        </div>
        <div>
          <b>{xp}</b>
          <span>XP</span>
        </div>
      </div>

      <h2>Accuracy</h2>
      <div className="stat-grid two">
        <div>
          <b>{pct(acc.speak)}</b>
          <span>Speak · {acc.speak.answers}</span>
        </div>
        <div>
          <b>{pct(acc.listen)}</b>
          <span>Listen · {acc.listen.answers}</span>
        </div>
        <div>
          <b>{pct(acc.see)}</b>
          <span>See · {acc.see.answers}</span>
        </div>
        <div>
          <b>{pct(acc.check)}</b>
          <span>Listen-and-pick · {acc.check.answers}</span>
        </div>
      </div>
      <p className="muted small">Every answer is checked by the app. Listen-and-pick is the check in Learn sessions.</p>

      <h2>Activity</h2>
      <div className="heatmap" role="img" aria-label={`Answers per day over the last ${WEEKS} weeks`}>
        {cells.map((c) => (
          <i key={c.key} className={c.future ? 'future' : `l${c.level}`} title={`${c.key}: ${c.count} answers`} />
        ))}
      </div>

      <h2>Expressions</h2>
      <p>
        <b>{introducedCount}</b> of {practiceCatalog.length} introduced · <b>{learnedCount}</b> Learned
        {ignored.size > 0 && <span className="muted"> · {ignored.size} Ignored</span>}
      </p>
      <ul className="list compact">
        {topics.map((t) => {
          const ids = practiceCatalog.filter((e) => e.topic === t.id).map((e) => e.id)
          return (
            <li key={t.id} className="row">
              <span>{t.name}</span>
              <span className="row-end">
                <span className="muted small">
                  {ids.filter((id) => learned.has(id)).length}/{ids.length}
                </span>
                <Stars count={progress.stars.get(t.id) ?? 0} />
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
