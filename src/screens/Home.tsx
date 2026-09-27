import { catalog } from '../catalog/index.ts'
import { BACKLOG_WARNING, BATCH_SIZE } from '../domain/progress.ts'
import type { Progress } from '../progress/useProgress.ts'

export function Home({ progress, onReview, onLearn }: { progress: Progress; onReview: () => void; onLearn: () => void }) {
  const { dueCount, nextBatchSize, introduced, learned } = progress
  const allIntroduced = nextBatchSize === 0
  const continueAction = dueCount > 0 ? onReview : allIntroduced ? null : onLearn
  const batchesDone = Math.ceil(introduced.size / BATCH_SIZE)
  const totalBatches = Math.ceil(catalog.length / BATCH_SIZE)

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
          <b>{learned.size}</b>
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

      {allIntroduced && dueCount === 0 && <p className="muted small">Every Expression is introduced. Come back when reviews are due.</p>}
    </section>
  )
}
