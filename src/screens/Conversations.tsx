import { useRef, useState } from 'react'
import { conversations } from '../../catalog/conversations.ts'
import { playClip, playClipToEnd, stopClip } from '../audio/player.ts'
import { VOICES } from '../audio/voices.ts'
import { expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { canPlay, expressionsOf, newExpressionsOf, prepareBatch, walkIntended, type Conversation } from '../domain/conversation.ts'
import type { Progress } from '../progress/useProgress.ts'

/**
 * Every Conversation, in curated order (most frequent situations first), with whether it's ready to play, and the way
 * into one. Opened from Home.
 */
export function ConversationsPage({
  progress,
  openId,
  onOpen,
  onPlay,
  onPrepare,
  onClose,
}: {
  progress: Progress
  openId: string | null
  onOpen: (id: string | null) => void
  onPlay: (c: Conversation) => void
  onPrepare: (batch: string[]) => void
  onClose: () => void
}) {
  const open = conversations.find((c) => c.id === openId)
  if (open)
    return (
      <ConversationPage
        conversation={open}
        progress={progress}
        onPlay={() => onPlay(open)}
        onPrepare={() => onPrepare(prepareBatch(open, progress.practiceCatalog, progress.introduced, progress.ignored))}
        onClose={() => onOpen(null)}
      />
    )
  return (
    <div className="session conversations-page">
      <div className="session-head">
        <button type="button" className="quit" onClick={onClose} aria-label="Back to Home">
          ‹
        </button>
        <span className="session-title page-title">Conversations</span>
      </div>
      <p className="muted small">Short exchanges from everyday travel. You play yourself; listen first, then reply.</p>
      <ul className="list">
        {conversations.map((c) => (
          <li key={c.id}>
            <button type="button" className="row conversation-row" onClick={() => onOpen(c.id)}>
              <span className="topic-main">
                <span>{c.title}</span>
                <span className="muted small">{c.setting}</span>
              </span>
              <StatusLabel conversation={c} progress={progress} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Whether a Conversation can be played yet: "Needs N new" until every Reply Turn has a Reply the learner has met. */
function StatusLabel({ conversation, progress }: { conversation: Conversation; progress: Progress }) {
  const fresh = newExpressionsOf(conversation, progress.practiceCatalog, progress.introduced, progress.ignored).length
  if (!canPlay(conversation, progress.introduced, progress.ignored)) return <span className="status-label">Needs {fresh} new</span>
  return <span className="status-label ready">Ready</span>
}

/** One Conversation: its setting, who you'll talk to, the Expressions it uses, Prepare, Watch and Play. */
function ConversationPage({
  conversation,
  progress,
  onPlay,
  onPrepare,
  onClose,
}: {
  conversation: Conversation
  progress: Progress
  onPlay: () => void
  onPrepare: () => void
  onClose: () => void
}) {
  const [watching, setWatching] = useState(false)
  if (watching) return <ConversationWatch conversation={conversation} onClose={() => setWatching(false)} />
  const used = expressionsOf(conversation).filter((id) => !progress.ignored.has(id))
  const fresh = newExpressionsOf(conversation, progress.practiceCatalog, progress.introduced, progress.ignored)
  const playable = canPlay(conversation, progress.introduced, progress.ignored)
  const batch = prepareBatch(conversation, progress.practiceCatalog, progress.introduced, progress.ignored)
  return (
    <div className="session conversation-page">
      <div className="session-head">
        <button type="button" className="quit" onClick={onClose} aria-label="Back to Conversations">
          ‹
        </button>
        <span className="session-title page-title">{conversation.title}</span>
      </div>
      <p>{conversation.setting}</p>
      <p className="muted small">You'll talk to {conversation.role}. Their lines play as audio; show the text only if you need it.</p>
      {fresh.length > 0 && (
        <button type="button" className={playable ? 'secondary-action' : 'primary-action'} onClick={onPrepare}>
          Prepare · {batch.length} new
        </button>
      )}
      <button type="button" className={playable ? 'primary-action' : 'secondary-action'} onClick={onPlay} disabled={!playable}>
        Play
      </button>
      {!playable && <p className="muted small">Prepare first: you'll learn the replies this conversation asks for.</p>}
      <button type="button" className="secondary-action" onClick={() => setWatching(true)}>
        Watch
      </button>
      <h2>In this conversation</h2>
      <ul className="list compact">
        {used.map((id) => (
          <li key={id} className="row">
            <ExpressionView expression={expressionById.get(id)!} size="compact" />
            {!progress.introduced.has(id) && <span className="focus-not-met">New</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One spoken step of a watched run: who says which Expression. */
type Said = { who: 'them' | 'you'; expressionId: string; catch?: { question: string; answer: string } }

/**
 * Watch: one whole run, following the intended Replies and random Variants, with all text visible for both sides.
 * Any line can be replayed, normal or slow. Nothing is graded, and it isn't a session.
 */
function ConversationWatch({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const [voices] = useState(() => {
    const them = VOICES[Math.floor(Math.random() * VOICES.length)]
    return { them, you: VOICES.find((v) => v !== them)! }
  })
  const [said] = useState<Said[]>(() =>
    walkIntended(conversation).flatMap((id): Said[] => {
      const t = conversation.turns[id]
      if (t.kind === 'line') return [{ who: 'them', expressionId: t.expressionId }]
      if (t.kind === 'reply') return [{ who: 'you', expressionId: t.accepted[0].expressionId }]
      if (t.kind === 'catch') return [{ who: 'them', expressionId: t.expressionId, catch: { question: t.question, answer: t.answer } }]
      return []
    }),
  )
  const [playing, setPlaying] = useState<number | null>(null)
  const stop = useRef(false)

  async function playAll() {
    stop.current = false
    for (let i = 0; i < said.length && !stop.current; i++) {
      if (said[i].catch) continue
      setPlaying(i)
      await playClipToEnd(said[i].expressionId, 'normal', voices[said[i].who])
    }
    setPlaying(null)
  }

  function close() {
    stop.current = true
    stopClip()
    onClose()
  }

  return (
    <div className="session conversation-watch">
      <div className="session-head">
        <button type="button" className="quit" onClick={close} aria-label="Back">
          ‹
        </button>
        <span className="session-title page-title">Watch · {conversation.title}</span>
      </div>
      <p className="muted small">{conversation.setting}</p>
      <button type="button" className="secondary-action" onClick={playAll} disabled={playing !== null}>
        {playing !== null ? 'Playing…' : 'Play all'}
      </button>
      <div className="chat">
        {said.map((s, i) =>
          s.catch ? (
            <p key={i} className="muted small watch-catch">
              {s.catch.question} <b>{s.catch.answer}</b>
            </p>
          ) : (
            <div key={i} className={`bubble ${s.who}${playing === i ? ' playing' : ''}`}>
              {s.who === 'them' && <span className="bubble-who">{conversation.role}</span>}
              <ExpressionView expression={expressionById.get(s.expressionId)!} size="compact" />
              <span className="bubble-play">
                <button type="button" className="play" onClick={() => playClip(s.expressionId, 'normal', voices[s.who])} aria-label="Play">
                  ▶
                </button>
                <button type="button" className="play slow" onClick={() => playClip(s.expressionId, 'slow', voices[s.who])} aria-label="Play slowly">
                  ½
                </button>
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
