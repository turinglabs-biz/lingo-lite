import { expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { FocusPin } from '../components/FocusPin.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { focusQueue } from '../domain/progress.ts'
import type { Progress } from '../progress/useProgress.ts'

/**
 * Every Focus Expression, and the way into a Focus session. Introduced ones come first, in the order they were put in
 * Focus; ones not met yet are marked and stay out of the session until a Batch introduces them.
 */
export function FocusPage({ progress, onStart, onClose }: { progress: Progress; onStart: () => void; onClose: () => void }) {
  const ids = [...progress.focus]
  const met = ids.filter((id) => progress.introduced.has(id))
  const notMet = ids.filter((id) => !progress.introduced.has(id))
  const questions = focusQueue(progress.cards, progress.focus, Date.now()).length

  return (
    <div className="session focus-page">
      <div className="session-head">
        <button type="button" className="quit" onClick={onClose} aria-label="Back to Home">
          ‹
        </button>
        <span className="session-title page-title">Focus</span>
      </div>
      <p className="muted small">
        Expressions in Focus come up about 2–3× as often in reviews and go first when due. Put any Expression in Focus with
        its pin, in a session or the Phrasebook.
      </p>

      <button type="button" className="primary-action" disabled={questions === 0} onClick={onStart}>
        {questions > 0 ? `Start Focus session · ${questions} questions` : 'Start Focus session'}
      </button>
      {ids.length > 0 && questions === 0 && <p className="muted small">None of your Focus Expressions has been introduced yet. A new Batch will bring them in.</p>}

      {ids.length === 0 ? (
        <p className="muted">Nothing in Focus yet.</p>
      ) : (
        <ul className="list focus-list">
          {[...met, ...notMet].map((id) => {
            const e = expressionById.get(id)!
            return (
              <li key={id} className="row">
                <div className="row-main">
                  <Illustration expressionId={id} size="small" />
                  <div className="focus-expression">
                    <ExpressionView expression={e} size="compact" />
                    {!progress.introduced.has(id) && <span className="focus-not-met">Not met yet</span>}
                  </div>
                </div>
                <div className="row-controls">
                  <PlayButtons expressionId={id} />
                  <div className="row-controls-line">
                    <FocusPin expressionId={id} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
