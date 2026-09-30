import { useEffect, useRef, useState } from 'react'
import { stopClip } from '../audio/player.ts'
import { expressionById } from '../catalog/index.ts'
import type { LoadedModel } from './engine.ts'
import { referencePoints } from './reference.ts'
import { startRecording, type Recorded, type Recording } from './recorder.ts'
import { scoreEcho, type EchoResult } from './scorer.ts'
import { expectedSounds } from './sounds.ts'

/**
 * Where an Echo is. While a new one is being recorded or scored, `previous` keeps the last result, so it can stay on
 * screen until the new one replaces it (nothing moves under the learner's finger).
 */
export type EchoState =
  | { phase: 'idle' }
  | { phase: 'starting' | 'listening' | 'scoring'; previous?: EchoAttempt }
  | { phase: 'done'; attempt: EchoAttempt }
  | { phase: 'error'; message: string }

/** The last finished attempt, if any, whatever is happening now. */
export function lastAttempt(state: EchoState): EchoAttempt | undefined {
  if (state.phase === 'done') return state.attempt
  return 'previous' in state ? state.previous : undefined
}

export interface EchoAttempt {
  result: EchoResult
  /** From letting go to the score, in ms. */
  scoreMs: number
  /** Model run time alone, in ms. */
  inferMs: number
  seconds: number
  recording: Blob | null
}

/**
 * One Echo on one Expression: hold to record, let go to score. Each new Echo replaces the previous result. Recordings
 * never leave the phone; the caller decides whether to keep the Blob (only the Echo lab does, for playback).
 */
export function useEcho(expressionId: string, model: LoadedModel | null, onDone?: (attempt: EchoAttempt) => void) {
  const [state, setState] = useState<EchoState>({ phase: 'idle' })
  const recording = useRef<Recording | null>(null)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => () => void recording.current?.stop(), [])

  async function begin() {
    if (!model || recording.current) return
    stopClip()
    setState((s) => ({ phase: 'starting', previous: lastAttempt(s) }))
    const r = startRecording(() => void end())
    recording.current = r
    try {
      await r.started
      if (recording.current === r) setState((s) => ({ phase: 'listening', previous: lastAttempt(s) }))
    } catch {
      recording.current = null
      setState((s) => {
        const previous = lastAttempt(s)
        return previous ? { phase: 'done', attempt: previous } : { phase: 'idle' }
      })
    }
  }

  async function end() {
    const r = recording.current
    if (!r || !model) return
    recording.current = null
    const releasedAt = performance.now()
    setState((s) => ({ phase: 'scoring', previous: lastAttempt(s) }))
    // Let the "Scoring…" state paint before the model blocks the main thread.
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)))
    let recorded: Recorded | null = null
    try {
      recorded = await r.stop()
    } catch {
      recorded = null
    }
    const expression = expressionById.get(expressionId)!
    const reference = referencePoints(model.model.id, expressionId) ?? { full: 1, zero: 0 }
    let result: EchoResult = { kind: 'not-heard', reason: 'too-short' }
    let inferMs = 0
    if (recorded && recorded.samples.length > 0) {
      try {
        const { output, ms } = await model.run(recorded.samples)
        inferMs = ms
        result = scoreEcho(output, expectedSounds(expression.romanization, model.model.vocabulary), reference)
      } catch (err) {
        setState({ phase: 'error', message: err instanceof Error ? err.message : String(err) })
        return
      }
    }
    const attempt: EchoAttempt = {
      result,
      scoreMs: performance.now() - releasedAt,
      inferMs,
      seconds: recorded?.seconds ?? 0,
      recording: recorded?.blob ?? null,
    }
    setState({ phase: 'done', attempt })
    done.current?.(attempt)
  }

  return { state, begin, end }
}
