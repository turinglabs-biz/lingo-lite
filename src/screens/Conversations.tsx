import { useRef, useState } from 'react'
import { conversations } from '../../catalog/conversations.ts'
import { playClip, playClipToEnd, stopClip } from '../audio/player.ts'
import { VOICES } from '../audio/voices.ts'
import { expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { walkIntended, type Conversation } from '../domain/conversation.ts'

/**
 * Every Conversation, in curated order (most frequent situations first), and the way into one. Opened from Home.
 */
export function ConversationsPage({ onPlay, onClose }: { onPlay: (c: Conversation) => void; onClose: () => void }) {
  const [open, setOpen] = useState<Conversation | null>(null)
  if (open) return <ConversationPage conversation={open} onPlay={() => onPlay(open)} onClose={() => setOpen(null)} />
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
            <button type="button" className="row conversation-row" onClick={() => setOpen(c)}>
              <span className="topic-main">
                <span>{c.title}</span>
                <span className="muted small">{c.setting}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One Conversation: its setting, who you'll talk to, Watch and Play. */
function ConversationPage({ conversation, onPlay, onClose }: { conversation: Conversation; onPlay: () => void; onClose: () => void }) {
  const [watching, setWatching] = useState(false)
  if (watching) return <ConversationWatch conversation={conversation} onClose={() => setWatching(false)} />
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
      <button type="button" className="primary-action" onClick={onPlay}>
        Play
      </button>
      <button type="button" className="secondary-action" onClick={() => setWatching(true)}>
        Watch
      </button>
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
