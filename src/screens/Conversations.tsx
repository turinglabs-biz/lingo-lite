import { useState } from 'react'
import { conversations } from '../../catalog/conversations.ts'
import type { Conversation } from '../domain/conversation.ts'

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

/** One Conversation: its setting, who you'll talk to, and Play. */
function ConversationPage({ conversation, onPlay, onClose }: { conversation: Conversation; onPlay: () => void; onClose: () => void }) {
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
    </div>
  )
}
