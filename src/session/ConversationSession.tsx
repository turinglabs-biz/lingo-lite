import { useEffect, useRef, useState } from 'react'
import { playClip, playClipToEnd } from '../audio/player.ts'
import { VOICES, type Voice } from '../audio/voices.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { shuffle } from '../domain/choices.ts'
import {
  checkReply,
  longestIntendedPath,
  replyOptions,
  resolveVariants,
  type Conversation,
  type ReplyResult,
  type TurnId,
} from '../domain/conversation.ts'
import { EchoBar } from '../echo/EchoMic.tsx'
import { useIgnored } from '../progress/ignored.tsx'
import type { PlayMode } from '../domain/types.ts'
import { useProgress } from '../progress/useProgress.ts'
import { finishConversationRun, recordCatch, recordReply, touchSession } from '../progress/store.ts'
import { Prompt, SessionFrame } from './parts.tsx'
import { SessionInput } from './sessionInput.ts'
import type { SummaryData } from './SessionSummary.tsx'
import { useSessionTracker } from './useSessionTracker.ts'

/** One message in the chat: something the other person said, or the learner's Reply. */
type Message =
  /** `shown`: how much of the Line's text is visible (none; Romanization and Hangul; also the English). */
  | { from: 'them'; expressionId: string; shown: 0 | 1 | 2 }
  | { from: 'you'; expressionId: string; missed?: string; repair?: boolean }

/** Repair: what the learner can say under any Line, and what the other person does in answer. */
const REPAIRS = [
  { expressionId: 'pardon', does: 'repeat' },
  { expressionId: 'slowly-please', does: 'slow' },
  { expressionId: 'speak-english', does: 'text' },
] as const

/**
 * A Conversation run: the other person's Lines play as audio with the text hidden, and at each Reply the learner says
 * it aloud, then picks it from four options, as in Speak. Guided play shows an intent at each Reply; Free play doesn't,
 * and may accept two of the options. Answers count for XP, Practice time and Stats; a finished run updates the
 * Conversation's own schedule. No Expression's schedule ever changes.
 */
export function ConversationSession({
  conversation,
  mode,
  onEnd,
}: {
  conversation: Conversation
  mode: PlayMode
  onEnd: (summary: Omit<SummaryData, 'streak'> | null) => void
}) {
  const tracker = useSessionTracker('conversation')
  const progress = useProgress()
  const [startedAt] = useState(() => Date.now())
  const missed = useRef(0)
  const ignored = useIgnored()
  // Each speaker keeps one Voice for the whole run.
  const [voices] = useState(() => {
    const them = VOICES[Math.floor(Math.random() * VOICES.length)]
    return { them, you: VOICES.find((v) => v !== them)! as Voice }
  })
  // Variants are decided the moment the Conversation reaches them.
  const [turnId, setTurnId] = useState<TurnId>(() => resolveVariants(conversation, conversation.start))
  const [lineNext, setLineNext] = useState<TurnId | null>(null)
  const [total] = useState(() => longestIntendedPath(conversation))
  const [messages, setMessages] = useState<Message[]>([])
  const [stage, setStage] = useState<'recall' | 'pick' | 'done'>('recall')
  const [result, setResult] = useState<(ReplyResult & { picked: string }) | null>(null)
  const [caught, setCaught] = useState<{ picked: string; correct: boolean } | null>(null)
  const [answered, setAnswered] = useState(0)
  const textShown = useRef(false)
  const repairs = useRef(0)
  const entered = useRef<TurnId | null>(null)
  const chatEnd = useRef<HTMLDivElement>(null)
  const turn = conversation.turns[turnId]

  // Entering a Line: it joins the chat and plays. Unless another Line follows, the Conversation moves straight on.
  useEffect(() => {
    if (entered.current === turnId) return
    entered.current = turnId
    // A Reply whose accepted Replies the learner has all Ignored is shown, not asked (as in Watch).
    if (turn.kind === 'reply' && turn.accepted.every((a) => ignored.has(a.expressionId))) {
      setMessages((m) => [...m, { from: 'you', expressionId: turn.accepted[0].expressionId }])
      playClip(turn.accepted[0].expressionId, 'normal', voices.you)
      setLineNext(resolveVariants(conversation, turn.accepted[0].next))
      return
    }
    if (turn.kind !== 'line') return
    setMessages((m) => [...m, { from: 'them', expressionId: turn.expressionId, shown: 0 }])
    playClip(turn.expressionId, 'normal', voices.them)
    const following = resolveVariants(conversation, turn.next)
    if (conversation.turns[following].kind === 'line') setLineNext(following)
    else setTurnId(following)
  }, [turnId, turn, conversation, voices, ignored])

  useEffect(() => {
    chatEnd.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, stage])

  const [options, setOptions] = useState<string[]>([])
  useEffect(() => {
    if (turn.kind === 'reply') setOptions(replyOptions(turn, conversation.topic, catalog, ignored, Math.random, 4, mode, progress?.introduced))
    if (turn.kind === 'catch') setOptions(shuffle([turn.answer, ...turn.wrong], Math.random))
    // Options are drawn once per Reply, so they don't reshuffle while Progress updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnId])

  async function pick(id: string) {
    if (turn.kind !== 'reply' || !tracker.sessionId) return
    const r = checkReply(turn, id)
    setResult({ ...r, picked: id })
    setStage('done')
    tracker.countAnswer(r.correct)
    if (!r.correct) missed.current++
    setAnswered((n) => n + 1)
    const said = r.correct ? id : r.expected!
    setMessages((m) => [...m, { from: 'you', expressionId: said, ...(r.correct ? {} : { missed: id }) }])
    playClip(said, 'normal', voices.you)
    await recordReply(tracker.sessionId, conversation.id, turnId, said, r.correct)
  }

  async function finish() {
    if (tracker.sessionId) {
      await finishConversationRun({
        conversationId: conversation.id,
        sessionId: tracker.sessionId,
        mode,
        startedAt,
        missed: missed.current,
        textShown: textShown.current,
        repairs: repairs.current,
      })
    }
    onEnd(await tracker.finish())
  }

  /** Shows more of a Line's text. Any text shown keeps the run from being clean. */
  function showText(index: number, level: 1 | 2) {
    textShown.current = true
    setMessages((m) => m.map((msg, i) => (i === index && msg.from === 'them' ? { ...msg, shown: Math.max(msg.shown, level) as 1 | 2 } : msg)))
  }

  /**
   * Repair: the learner says 네?, 천천히 말해 주세요 or 영어 하세요?, and the other person repeats the last Line, repeats it
   * slowly, or (as a last resort) the text appears. Never a mistake.
   */
  async function repair(r: (typeof REPAIRS)[number]) {
    const index = messages.findLastIndex((m) => m.from === 'them')
    if (index < 0) return
    const line = messages[index].expressionId
    repairs.current++
    if (tracker.sessionId) touchSession(tracker.sessionId)
    setMessages((m) => [...m, { from: 'you', expressionId: r.expressionId, repair: true }])
    await playClipToEnd(r.expressionId, 'normal', voices.you)
    if (r.does === 'repeat') playClip(line, 'normal', voices.them)
    if (r.does === 'slow') playClip(line, 'slow', voices.them)
    if (r.does === 'text') showText(index, 2)
  }

  /** A Catch: what did they say? A miss shows the right answer and replays the Line. */
  async function pickCatch(option: string) {
    if (turn.kind !== 'catch' || !tracker.sessionId) return
    const correct = option === turn.answer
    setCaught({ picked: option, correct })
    tracker.countAnswer(correct)
    if (!correct) missed.current++
    setAnswered((n) => n + 1)
    if (!correct) playClip(turn.expressionId, 'normal', voices.them)
    await recordCatch(tracker.sessionId, conversation.id, turnId, turn.expressionId, correct)
  }

  function next(to: TurnId) {
    setResult(null)
    setCaught(null)
    setLineNext(null)
    setStage('recall')
    setTurnId(resolveVariants(conversation, to))
  }

  const intended = turn.kind === 'reply' ? turn.accepted[0].expressionId : undefined
  return (
    <SessionInput.Provider value={() => tracker.sessionId && touchSession(tracker.sessionId)}>
      <SessionFrame title={conversation.title} position={Math.min(messages.length + answered, total)} total={total} onQuit={() => onEnd(null)}>
        <p className="muted small conversation-setting">{conversation.setting}</p>
        <div className="chat">
          {messages.map((m, i) =>
            m.from === 'them' ? (
              <LineBubble key={i} expressionId={m.expressionId} role={conversation.role} voice={voices.them} shown={m.shown} onShow={(level) => showText(i, level)} />
            ) : (
              <div key={i} className={m.missed ? 'bubble you missed' : m.repair ? 'bubble you repair' : 'bubble you'}>
                <ExpressionView expression={expressionById.get(m.expressionId)!} size="compact" />
                {m.missed && <p className="small bubble-note">You picked {expressionById.get(m.missed)!.romanization}; this one fits.</p>}
              </div>
            ),
          )}
          <div ref={chatEnd} />
        </div>

        {turn.kind !== 'end' && messages.some((m) => m.from === 'them') && (
          <div className="repair-chips" aria-label="Ask them to repeat">
            {REPAIRS.map((r) => (
              <button key={r.expressionId} type="button" className="chip" onClick={() => repair(r)}>
                {expressionById.get(r.expressionId)!.hangul}
              </button>
            ))}
          </div>
        )}

        {turn.kind === 'line' && lineNext && (
          <button type="button" className="primary-action" onClick={() => next(lineNext)}>
            Next
          </button>
        )}

        {turn.kind === 'catch' && (
          <div className="reply-panel" data-turn={turnId}>
            <Prompt label="Did you catch it?">
              <p className="english-prompt">{turn.question}</p>
            </Prompt>
            <div className="options">
              {options.map((o) => {
                const state = !caught ? '' : o === turn.answer ? 'right' : o === caught.picked ? 'wrong' : 'dim'
                return (
                  <button key={o} type="button" className={`option ${state}`} disabled={!!caught} onClick={() => pickCatch(o)}>
                    {o}
                  </button>
                )
              })}
            </div>
            {caught && (
              <button type="button" className="primary-action" onClick={() => next(turn.next)}>
                Next
              </button>
            )}
          </div>
        )}

        {turn.kind === 'reply' && lineNext && (
          <button type="button" className="primary-action" onClick={() => next(lineNext)}>
            Next
          </button>
        )}

        {turn.kind === 'reply' && !lineNext && (
          <div className="reply-panel" data-turn={turnId}>
            <Prompt label="Your turn">
              {mode === 'guided' ? <p className="english-prompt">{turn.intent}</p> : <p className="english-prompt">What do you say?</p>}
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
          <button type="button" className="primary-action" onClick={finish}>
            Finish
          </button>
        )}
      </SessionFrame>
    </SessionInput.Provider>
  )
}

/** The other person's Line: audio first, the text only on request (Romanization and Hangul, then the English). */
function LineBubble({
  expressionId,
  role,
  voice,
  shown,
  onShow,
}: {
  expressionId: string
  role: string
  voice: Voice
  shown: 0 | 1 | 2
  onShow: (level: 1 | 2) => void
}) {
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
            onClick={() => onShow(shown === 0 ? 1 : 2)}
          >
            {shown === 0 ? 'Show text' : 'Show meaning'}
          </button>
        )}
      </span>
      {shown > 0 && <ExpressionView expression={e} size="compact" showEnglish={shown === 2} />}
    </div>
  )
}
