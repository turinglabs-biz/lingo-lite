import { useEffect, useRef, useState } from 'react'
import { playClip } from '../audio/player.ts'
import { VOICES, type Voice } from '../audio/voices.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { checkReply, replyOptions, type Conversation, type ReplyResult, type TurnId } from '../domain/conversation.ts'
import { EchoBar } from '../echo/EchoMic.tsx'
import { useIgnored } from '../progress/ignored.tsx'
import { recordReply, touchSession } from '../progress/store.ts'
import { Prompt, SessionFrame } from './parts.tsx'
import { SessionInput } from './sessionInput.ts'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

/** One message in the chat: something the other person said, or the learner's Reply. */
type Message = { from: 'them'; expressionId: string } | { from: 'you'; expressionId: string; missed?: string }

/** How many Turns the intended path takes, for the progress bar. */
function pathLength(c: Conversation): number {
  let n = 0
  for (let t = c.turns[c.start]; t.kind !== 'end'; n++) t = c.turns[t.kind === 'line' ? t.next : t.accepted[0].next]
  return n
}

/**
 * A Conversation in Guided play: the other person's Lines play as audio with the text hidden, and at each Reply the
 * learner reads the intent, says it aloud, then picks it from four options, as in Speak. Answers count for XP,
 * Practice time and Stats; no Expression's schedule changes.
 */
export function ConversationSession({ conversation, onEnd }: { conversation: Conversation; onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void }) {
  const tracker = useSessionTracker('conversation')
  const ignored = useIgnored()
  // Each speaker keeps one Voice for the whole run.
  const [voices] = useState(() => {
    const them = VOICES[Math.floor(Math.random() * VOICES.length)]
    return { them, you: VOICES.find((v) => v !== them)! as Voice }
  })
  const [turnId, setTurnId] = useState<TurnId>(conversation.start)
  const [messages, setMessages] = useState<Message[]>([])
  const [stage, setStage] = useState<'recall' | 'pick' | 'done'>('recall')
  const [result, setResult] = useState<(ReplyResult & { picked: string }) | null>(null)
  const textShown = useRef(false)
  const entered = useRef<TurnId | null>(null)
  const chatEnd = useRef<HTMLDivElement>(null)
  const turn = conversation.turns[turnId]

  // Entering a Line: it joins the chat and plays. A Line followed by a Reply or the end moves straight on.
  useEffect(() => {
    if (entered.current === turnId) return
    entered.current = turnId
    if (turn.kind !== 'line') return
    setMessages((m) => [...m, { from: 'them', expressionId: turn.expressionId }])
    playClip(turn.expressionId, 'normal', voices.them)
    if (conversation.turns[turn.next].kind !== 'line') setTurnId(turn.next)
  }, [turnId, turn, conversation, voices])

  useEffect(() => {
    chatEnd.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, stage])

  const [options, setOptions] = useState<string[]>([])
  useEffect(() => {
    if (turn.kind === 'reply') setOptions(replyOptions(turn, conversation.topic, catalog, ignored))
    // Options are drawn once per Reply, so they don't reshuffle while Progress updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnId])

  async function pick(id: string) {
    if (turn.kind !== 'reply' || !tracker.sessionId) return
    const r = checkReply(turn, id)
    setResult({ ...r, picked: id })
    setStage('done')
    tracker.countAnswer(r.correct)
    const said = r.correct ? id : r.expected!
    setMessages((m) => [...m, { from: 'you', expressionId: said, ...(r.correct ? {} : { missed: id }) }])
    playClip(said, 'normal', voices.you)
    await recordReply(tracker.sessionId, conversation.id, turnId, said, r.correct)
  }

  function next(to: TurnId) {
    setResult(null)
    setStage('recall')
    setTurnId(to)
  }

  const intended = turn.kind === 'reply' ? turn.accepted[0].expressionId : undefined
  return (
    <SessionInput.Provider value={() => tracker.sessionId && touchSession(tracker.sessionId)}>
      <SessionFrame title={conversation.title} position={Math.min(messages.length, pathLength(conversation))} total={pathLength(conversation)} onQuit={() => onEnd(null)}>
        <p className="muted small conversation-setting">{conversation.setting}</p>
        <div className="chat">
          {messages.map((m, i) =>
            m.from === 'them' ? (
              <LineBubble key={i} expressionId={m.expressionId} role={conversation.role} voice={voices.them} onShowText={() => (textShown.current = true)} />
            ) : (
              <div key={i} className={m.missed ? 'bubble you missed' : 'bubble you'}>
                <ExpressionView expression={expressionById.get(m.expressionId)!} size="compact" />
                {m.missed && <p className="small bubble-note">You picked {expressionById.get(m.missed)!.romanization}; this one fits.</p>}
              </div>
            ),
          )}
          <div ref={chatEnd} />
        </div>

        {turn.kind === 'line' && (
          <button type="button" className="primary-action" onClick={() => next(turn.next)}>
            Next
          </button>
        )}

        {turn.kind === 'reply' && (
          <div className="reply-panel">
            <Prompt label="Your turn">
              <p className="english-prompt">{turn.intent}</p>
            </Prompt>
            {stage === 'recall' && (
              <>
                <EchoBar expressionId={intended!} hint="Say it from memory to check yourself" />
                <button type="button" className="primary-action" onClick={() => setStage('pick')}>
                  I said it, show options
                </button>
              </>
            )}
            {stage !== 'recall' && (
              <div className="options">
                {options.map((id) => {
                  const state = !result ? '' : turn.accepted.some((a) => a.expressionId === id) ? 'right' : id === result.picked ? 'wrong' : 'dim'
                  return (
                    <button key={id} type="button" className={`option ${state}`} disabled={!!result} onClick={() => pick(id)}>
                      <ExpressionView expression={expressionById.get(id)!} size="compact" showEnglish={false} />
                    </button>
                  )
                })}
              </div>
            )}
            {result && (
              <button type="button" className="primary-action" onClick={() => next(result.next)}>
                Next
              </button>
            )}
          </div>
        )}

        {turn.kind === 'end' && (
          <button type="button" className="primary-action" onClick={async () => onEnd(await tracker.finish())}>
            Finish
          </button>
        )}
      </SessionFrame>
    </SessionInput.Provider>
  )
}

/** The other person's Line: audio first, the text only on request (Romanization and Hangul, then the English). */
function LineBubble({ expressionId, role, voice, onShowText }: { expressionId: string; role: string; voice: Voice; onShowText: () => void }) {
  const [shown, setShown] = useState<0 | 1 | 2>(0)
  const e = expressionById.get(expressionId)!
  return (
    <div className="bubble them">
      <span className="bubble-who">{role}</span>
      <span className="bubble-play">
        <button type="button" className="play" onClick={() => playClip(expressionId, 'normal', voice)} aria-label="Play again">
          ▶
        </button>
        <button type="button" className="play slow" onClick={() => playClip(expressionId, 'slow', voice)} aria-label="Play slowly">
          ½
        </button>
        {shown < 2 && (
          <button
            type="button"
            className="show-text"
            onClick={() => {
              onShowText()
              setShown((s) => (s + 1) as 1 | 2)
            }}
          >
            {shown === 0 ? 'Show text' : 'Show meaning'}
          </button>
        )}
      </span>
      {shown > 0 && <ExpressionView expression={e} size="compact" showEnglish={shown === 2} />}
    </div>
  )
}
