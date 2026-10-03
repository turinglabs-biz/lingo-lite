import { BACKLOG_WARNING, BATCH_SIZE } from '../domain/progress.ts'
import type { Progress } from '../progress/useProgress.ts'

export function Home({ progress, onReview, onLearn, onFocus }: { progress: Progress; onReview: () => void; onLearn: () => void; onFocus: () => void }) {
  const { dueCount, nextBatchSize, introduced, learned, focus, ignored, practiceCatalog } = progress
  // Ignored Expressions are left out of every count.
  const introducedCount = [...introduced].filter((id) => !ignored.has(id)).length
  const learnedCount = [...learned].filter((id) => !ignored.has(id)).length
  const allIntroduced = nextBatchSize === 0
  const continueAction = dueCount > 0 ? onReview : allIntroduced ? null : onLearn
  const batchesDone = Math.ceil(introducedCount / BATCH_SIZE)
  const totalBatches = Math.ceil(practiceCatalog.length / BATCH_SIZE)

  return (
    <section className="screen home">
      <div className="home-hero">
        <h1 lang="ko">안녕하세요!</h1>
        <p className="muted">an-nyeong-ha-se-yo</p>
      </div>

      <div className="home-stats">
        <div>
          <b>{dueCount}</b>
          <span>reviews due</span>
        </div>
        <div>
          <b>{learnedCount}</b>
          <span>Learned</span>
        </div>
        <div>
          <b>
            {Math.min(batchesDone, totalBatches)}/{totalBatches}
          </b>
          <span>Batches</span>
        </div>
      </div>

      <button type="button" className="primary-action" onClick={continueAction ?? undefined} disabled={!continueAction}>
        {dueCount > 0 ? `Continue · review ${Math.min(dueCount, 20)}` : allIntroduced ? 'All caught up' : `Continue · learn ${nextBatchSize} new`}
      </button>

      {dueCount > BACKLOG_WARNING && !allIntroduced && (
        <p className="notice">
          {dueCount} reviews are waiting. Reviewing first keeps what you already learned; new Expressions will still be here.
        </p>
      )}

      {!allIntroduced && dueCount > 0 && (
        <button type="button" className="secondary-action" onClick={onLearn}>
          New Batch · {nextBatchSize} Expressions
        </button>
      )}

      <button type="button" className="secondary-action focus-action" onClick={onFocus}>
        Focus · {focus.size} {focus.size === 1 ? 'Expression' : 'Expressions'}
      </button>

      {allIntroduced && dueCount === 0 && <p className="muted small">Every Expression is introduced. Come back when reviews are due.</p>}
    </section>
  )
}
