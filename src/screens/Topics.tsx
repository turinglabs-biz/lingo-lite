import { catalog, topics, type TopicId } from '../catalog/index.ts'
import type { Progress } from '../progress/useProgress.ts'

export function Stars({ count }: { count: number }) {
  return (
    <span className="stars" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? 'on' : ''}>
          ★
        </span>
      ))}
    </span>
  )
}

export function Topics({ progress, onOpen }: { progress: Progress; onOpen: (topic: TopicId) => void }) {
  return (
    <section className="screen">
      <h1>Topics</h1>
      <ul className="list">
        {topics.map((t) => {
          // Ignored Expressions are left out of the Topic's counts, as they are of its Stars.
          const all = catalog.filter((e) => e.topic === t.id).map((e) => e.id)
          const ids = all.filter((id) => !progress.ignored.has(id))
          const ignoredHere = all.length - ids.length
          const introduced = ids.filter((id) => progress.introduced.has(id)).length
          const learned = ids.filter((id) => progress.learned.has(id)).length
          return (
            <li key={t.id}>
              <button type="button" className="row topic" onClick={() => onOpen(t.id)}>
                <span className="topic-main">
                  <span>{t.name}</span>
                  <span className="muted small">
                    {introduced}/{ids.length} introduced · {learned} Learned
                    {ignoredHere > 0 && ` · ${ignoredHere} Ignored`}
                  </span>
                  <span className="meter">
                    <i className="introduced" style={{ width: `${(introduced / Math.max(ids.length, 1)) * 100}%` }} />
                    <i className="learned" style={{ width: `${(learned / Math.max(ids.length, 1)) * 100}%` }} />
                  </span>
                </span>
                <Stars count={progress.stars.get(t.id) ?? 0} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
