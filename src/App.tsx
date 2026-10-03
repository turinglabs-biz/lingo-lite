import { useState } from 'react'
import { stopClip } from './audio/player.ts'
import type { TopicId } from './catalog/index.ts'
import { dueCards, focusQueue, nextBatch, REVIEW_SESSION_SIZE } from './domain/progress.ts'
import type { DirectionCard } from './domain/types.ts'
import { EchoLab } from './echo/lab/EchoLab.tsx'
import { FocusPage } from './screens/FocusPage.tsx'
import { useProgress } from './progress/useProgress.ts'
import { Home } from './screens/Home.tsx'
import { Phrasebook } from './screens/Phrasebook.tsx'
import { SettingsScreen } from './screens/Settings.tsx'
import { Stats } from './screens/Stats.tsx'
import { Topics } from './screens/Topics.tsx'
import { LearnSession } from './session/LearnSession.tsx'
import { ReviewSession } from './session/ReviewSession.tsx'
import { SessionSummary, type SummaryData } from './session/SessionSummary.tsx'

const TABS = [
  { id: 'home', label: 'Home', icon: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z' },
  { id: 'topics', label: 'Topics', icon: 'M5 6h14M5 12h14M5 18h9' },
  { id: 'phrasebook', label: 'Phrasebook', icon: 'M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3zM8 19V9' },
  { id: 'stats', label: 'Stats', icon: 'M5 19V11M12 19V5M19 19v-7' },
  { id: 'settings', label: 'Settings', icon: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4' },
] as const
type TabId = (typeof TABS)[number]['id']

type Active =
  | { kind: 'learn'; batch: string[] }
  | { kind: 'review' | 'focus'; cards: DirectionCard[] }
  | { kind: 'summary'; data: SummaryData }
  | null

export function App() {
  const progress = useProgress()
  const [tab, setTab] = useState<TabId>('home')
  const [phrasebookTopic, setPhrasebookTopic] = useState<TopicId | null>(null)
  const [active, setActive] = useState<Active>(null)
  const [echoLab, setEchoLab] = useState(false)
  const [focusPage, setFocusPage] = useState(false)

  if (!progress) return <div className="app loading" />

  // Sessions are built only from Expressions that aren't Ignored.
  const startLearn = () =>
    setActive({ kind: 'learn', batch: nextBatch(progress.practiceCatalog, progress.introduced, progress.focus).map((e) => e.id) })
  const startReview = () =>
    setActive({ kind: 'review', cards: dueCards(progress.practiceCards, Date.now(), REVIEW_SESSION_SIZE, progress.focus) })
  const startFocus = () => setActive({ kind: 'focus', cards: focusQueue(progress.practiceCards, progress.focus, Date.now()) })
  const endSession = (summary: Omit<SummaryData, 'streak'> | null) => {
    stopClip()
    // Streak includes today's session once it is finished.
    setActive(summary ? { kind: 'summary', data: { ...summary, streak: Math.max(progress.streak.current, 1) } } : null)
  }

  if (echoLab) return <EchoLab onClose={() => setEchoLab(false)} />
  if (active?.kind === 'learn') return <LearnSession batch={active.batch} introduced={progress.introduced} onEnd={endSession} />
  if (active?.kind === 'review' || active?.kind === 'focus')
    return <ReviewSession cards={active.cards} type={active.kind} introduced={progress.introduced} onEnd={endSession} />
  if (active?.kind === 'summary')
    return (
      <SessionSummary
        data={{ ...active.data, streak: Math.max(progress.streak.current, active.data.streak) }}
        onDone={() => setActive(null)}
      />
    )
  // After a Focus session (and its summary), the learner is back on the Focus page.
  if (focusPage) return <FocusPage progress={progress} onStart={startFocus} onClose={() => setFocusPage(false)} />

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">Lingo Lite</span>
        <span className="badges">
          <span className="badge streak" title="Day streak">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.3 1.6 1.8 2.3 1.8C11 7.5 11.3 5 12 3z" fill="currentColor" />
            </svg>
            {progress.streak.current}
          </span>
          <span className="badge xp" title="XP">
            {progress.xp} XP
          </span>
        </span>
      </header>
      <main>
        {tab === 'home' && <Home progress={progress} onReview={startReview} onLearn={startLearn} onFocus={() => setFocusPage(true)} />}
        {tab === 'topics' && (
          <Topics
            progress={progress}
            onOpen={(t) => {
              setPhrasebookTopic(t)
              setTab('phrasebook')
            }}
          />
        )}
        {tab === 'phrasebook' && <Phrasebook topic={phrasebookTopic} onTopicChange={setPhrasebookTopic} />}
        {tab === 'stats' && <Stats progress={progress} />}
        {tab === 'settings' && <SettingsScreen onOpenEchoLab={() => setEchoLab(true)} />}
      </main>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={t.id === tab ? 'active' : ''} onClick={() => setTab(t.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={t.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
