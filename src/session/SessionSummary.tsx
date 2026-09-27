import { expressionById } from '../catalog/index.ts'

export interface SummaryData {
  answers: number
  correct: number
  xp: number
  newlyLearned: string[]
  streak: number
}

export function SessionSummary({ data, onDone }: { data: SummaryData; onDone: () => void }) {
  const accuracy = data.answers ? Math.round((data.correct / data.answers) * 100) : 0
  return (
    <section className="session summary">
      <h1>잘했어요!</h1>
      <p className="muted">jal-hae-sseo-yo, well done.</p>
      <div className="summary-grid">
        <div>
          <b>{accuracy}%</b>
          <span>accuracy</span>
        </div>
        <div>
          <b>+{data.xp}</b>
          <span>XP</span>
        </div>
        <div>
          <b>{data.streak}</b>
          <span>day streak</span>
        </div>
      </div>
      {data.newlyLearned.length > 0 && (
        <div className="newly-learned">
          <span className="eyebrow">Newly Learned</span>
          <ul>
            {data.newlyLearned.map((id) => {
              const e = expressionById.get(id)
              return e ? (
                <li key={id}>
                  <b>{e.romanization}</b> <span className="muted">{e.english}</span>
                </li>
              ) : null
            })}
          </ul>
        </div>
      )}
      <button type="button" className="primary-action" onClick={onDone}>
        Done
      </button>
    </section>
  )
}
