import { useEffect, useRef, useState, type ReactNode } from 'react'
import { illustrationSiblings } from '../../catalog/illustrations.ts'
import { playClip } from '../audio/player.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { ExpressionView } from '../components/ExpressionView.tsx'
import { Illustration } from '../components/Illustration.tsx'
import { PlayButtons } from '../components/PlayButtons.tsx'
import { choiceOptions } from '../domain/choices.ts'
import { EchoBar } from '../echo/EchoMic.tsx'
import { Prompt } from './parts.tsx'

// The three checked question types. Each is mounted fresh per question (give it a `key`), reports the answer
// once via onAnswer, and calls onNext when the learner moves on.

interface QuestionProps {
  expressionId: string
  /** Distractors prefer already introduced Expressions. */
  introduced: Set<string>
  /** Fixed options (e.g. from a Learn plan); computed when omitted. */
  options?: string[]
  onAnswer: (correct: boolean) => void
  onNext: () => void
}

function useOptions(expressionId: string, introduced: Set<string>, fixed?: string[]) {
  // Computed once per question so options don't reshuffle while Progress updates.
  const [options] = useState(
    () => fixed ?? choiceOptions(expressionById.get(expressionId)!, catalog, new Set(illustrationSiblings(expressionId)), introduced),
  )
  return options
}

function Choices({ options, answer, onPick, render }: { options: string[]; answer: string; onPick: (id: string) => void; render: (id: string) => ReactNode }) {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="options">
      {options.map((id) => {
        const state = !picked ? '' : id === answer ? 'right' : id === picked ? 'wrong' : 'dim'
        return (
          <button
            key={id}
            type="button"
            className={`option ${state}`}
            disabled={!!picked}
            onClick={() => {
              setPicked(id)
              onPick(id)
            }}
          >
            {render(id)}
          </button>
        )
      })}
    </div>
  )
}

/** After answering: the full Expression with its picture and audio, Echo (when on), then Next. */
function Answer({ expressionId, onNext }: { expressionId: string; onNext: () => void }) {
  // On a small screen the card lands below the options; bring it into view (above the pinned Next).
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    card.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' })
  }, [])
  return (
    <>
      <div className="answer" ref={card}>
        <Illustration expressionId={expressionId} size="small" />
        <ExpressionView expression={expressionById.get(expressionId)!} size="medium" />
        <PlayButtons expressionId={expressionId} />
      </div>
      <EchoBar expressionId={expressionId} />
      <button type="button" className="primary-action" onClick={onNext}>
        Next
      </button>
    </>
  )
}

const korean = (id: string) => <ExpressionView expression={expressionById.get(id)!} size="compact" showEnglish={false} />
const english = (id: string) => expressionById.get(id)!.english

/** English prompt → say it aloud → pick the Korean → the phrase plays. */
export function SpeakQuestion({ expressionId, introduced, options: fixed, onAnswer, onNext }: QuestionProps) {
  const e = expressionById.get(expressionId)!
  const options = useOptions(expressionId, introduced, fixed)
  const [stage, setStage] = useState<'recall' | 'pick' | 'done'>('recall')
  return (
    <>
      <Prompt label="Say it in Korean" expressionId={expressionId}>
        <p className="english-prompt">{e.english}</p>
        {e.usageNote && <p className="muted small">{e.usageNote}</p>}
      </Prompt>
      {stage === 'recall' ? (
        <button type="button" className="primary-action" onClick={() => setStage('pick')}>
          I said it, show options
        </button>
      ) : (
        <Choices
          options={options}
          answer={expressionId}
          render={korean}
          onPick={(id) => {
            setStage('done')
            playClip(expressionId, 'normal')
            onAnswer(id === expressionId)
          }}
        />
      )}
      {stage === 'done' && <Answer expressionId={expressionId} onNext={onNext} />}
    </>
  )
}

/** The Clip plays → pick the English. */
export function ListenQuestion({ expressionId, introduced, options: fixed, onAnswer, onNext }: QuestionProps) {
  const options = useOptions(expressionId, introduced, fixed)
  const [done, setDone] = useState(false)
  useEffect(() => {
    playClip(expressionId, 'normal')
  }, [expressionId])
  return (
    <>
      <Prompt label="What does it mean?" expressionId={expressionId}>
        <PlayButtons expressionId={expressionId} size="large" />
      </Prompt>
      <Choices
        options={options}
        answer={expressionId}
        render={english}
        onPick={(id) => {
          setDone(true)
          onAnswer(id === expressionId)
        }}
      />
      {done && <Answer expressionId={expressionId} onNext={onNext} />}
    </>
  )
}

/** The Illustration → pick the Korean → the phrase plays. */
export function SeeQuestion({ expressionId, introduced, options: fixed, onAnswer, onNext }: QuestionProps) {
  const options = useOptions(expressionId, introduced, fixed)
  const [done, setDone] = useState(false)
  return (
    <>
      <Prompt label="Which one matches the picture?" expressionId={expressionId}>
        <Illustration expressionId={expressionId} size="large" />
      </Prompt>
      <Choices
        options={options}
        answer={expressionId}
        render={korean}
        onPick={(id) => {
          setDone(true)
          playClip(expressionId, 'normal')
          onAnswer(id === expressionId)
        }}
      />
      {done && <Answer expressionId={expressionId} onNext={onNext} />}
    </>
  )
}

