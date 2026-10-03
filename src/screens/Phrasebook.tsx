import { useMemo, useState } from 'react'
import { catalog, expressionById, topics, type TopicId } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { FocusPin } from '../components/FocusPin.tsx'
import { IgnoreToggle } from '../components/IgnoreToggle.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { EchoRound } from '../echo/EchoMic.tsx'
import { useIgnored } from '../progress/ignored.tsx'

const normalize = (s: string) => s.toLowerCase().replace(/[-?!.,'’]/g, '').replace(/\s+/g, ' ').trim()

/**
 * The whole Catalog for use on the street. Never changes Progress, except putting Expressions in Focus or marking them
 * Ignored. Ignored Expressions stay listed, only dimmed: the learner may still need to show one.
 */
export function Phrasebook({ topic, onTopicChange }: { topic: TopicId | null; onTopicChange: (t: TopicId | null) => void }) {
  const [query, setQuery] = useState('')
  const [showing, setShowing] = useState<string | null>(null)
  const ignored = useIgnored()

  const results = useMemo(() => {
    const q = normalize(query)
    const qCompact = q.replace(/ /g, '')
    return catalog.filter((e) => {
      if (topic && e.topic !== topic) return false
      if (!q) return true
      return (
        normalize(e.english).includes(q) ||
        normalize(e.romanization).replace(/ /g, '').includes(qCompact) ||
        e.hangul.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
      )
    })
  }, [query, topic])

  if (showing) {
    const e = expressionById.get(showing)!
    return (
      <section className="show" onClick={() => setShowing(null)}>
        <Illustration expressionId={e.id} size="large" />
        <p className="show-hangul" lang="ko">
          {e.hangul}
        </p>
        <p className="show-rom">{e.romanization}</p>
        <p className="show-en">{e.english}</p>
        <div onClick={(ev) => ev.stopPropagation()}>
          <PlayButtons expressionId={e.id} size="large" />
        </div>
        <p className="muted small">Tap anywhere to close</p>
      </section>
    )
  }

  return (
    <section className="screen">
      <h1>Phrasebook</h1>
      <input
        id="phrasebook-search"
        className="search"
        type="search"
        placeholder="Search English, romanization or 한글"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      <div className="chips">
        <button type="button" className={topic === null ? 'chip on' : 'chip'} onClick={() => onTopicChange(null)}>
          All
        </button>
        {topics.map((t) => (
          <button key={t.id} type="button" className={topic === t.id ? 'chip on' : 'chip'} onClick={() => onTopicChange(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
      {topics
        .filter((t) => results.some((e) => e.topic === t.id))
        .map((t) => (
          <div key={t.id} className="group">
            <h2>{t.name}</h2>
            <ul className="list">
              {results
                .filter((e) => e.topic === t.id)
                .map((e) => (
                  <li key={e.id} className={ignored.has(e.id) ? 'row ignored' : 'row'}>
                    <button type="button" className="row-main" onClick={() => setShowing(e.id)} aria-label={`Show ${e.english} full screen`}>
                      <Illustration expressionId={e.id} size="small" />
                      <ExpressionView expression={e} size="compact" />
                    </button>
                    <div className="row-controls">
                      <PlayButtons expressionId={e.id} />
                      <div className="row-controls-line">
                        <IgnoreToggle expressionId={e.id} />
                        <FocusPin expressionId={e.id} />
                        <EchoRound expressionId={e.id} />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      {results.length === 0 && <p className="muted">Nothing matches “{query}”.</p>}
    </section>
  )
}
