// Scores one Echo: how close the sounds of a recording were to the Expression's expected sounds (ADR 0004).
//
// The model gives, for every ~20 ms frame, a probability for each sound plus a "blank" (no new sound). For each
// expected sound we ask: how likely is the whole expected sequence, compared with the same sequence with that one
// sound swapped for any other sound or left out? That share is the sound's rating (0–1), with a sound's accepted
// variants (see ExpectedSound) counting as right. The raw score is the average rating, and the Echo score maps it onto
// the Expression's reference points.

import type { ExpectedSound } from './sounds.ts'

/** What a model heard in one recording. Column 0 is the blank; the other columns are the model's sounds. */
export interface ModelOutput {
  /** Log-probabilities, frames × columns, row-major. */
  logProbs: Float32Array
  frames: number
  /** Column names: '' for the blank, then one sound per column. */
  columns: readonly string[]
}

/** The raw scores that map to 100% (as close as the app's own Voices) and 0% (a different Expression). */
export interface ReferencePoints {
  full: number
  zero: number
}

export type NotHeardReason = 'too-short' | 'no-speech' | 'too-short-for-sounds'

export type EchoResult =
  | { kind: 'heard'; score: number; raw: number; sounds: { sound: string; rating: number }[] }
  | { kind: 'not-heard'; reason: NotHeardReason }

/** Bump whenever scoring changes, so the reference table must be recomputed (npm run echo:reference). */
export const SCORER_VERSION = 1

/** wav2vec2 models give one frame per 20 ms, so 15 frames is 0.3 s. */
export const MIN_FRAMES = 15
/** Reference points closer than this are treated as this far apart, so the scale never divides by ~0. */
export const MIN_RANGE = 0.05

/**
 * Turns raw model logits (frames × model outputs) into a ModelOutput: log-softmax per frame, with every token in
 * `blankTokens` (padding, word breaks, unknown) and every output the vocabulary doesn't name (e.g. start and end
 * tokens) folded into the blank column.
 */
export function toModelOutput(logits: Float32Array, frames: number, vocabulary: readonly string[], blankTokens: readonly string[]): ModelOutput {
  const size = logits.length / frames
  const blanks = new Set(blankTokens)
  const isSound = (i: number) => i < vocabulary.length && !blanks.has(vocabulary[i])
  const all = Array.from({ length: size }, (_, i) => i)
  const soundIndex = all.filter(isSound)
  const blankIndex = all.filter((i) => !isSound(i))
  const columns = ['', ...soundIndex.map((i) => vocabulary[i])]
  const logProbs = new Float32Array(frames * columns.length)
  for (let t = 0; t < frames; t++) {
    const row = logits.subarray(t * size, (t + 1) * size)
    let max = -Infinity
    for (let i = 0; i < size; i++) max = Math.max(max, row[i])
    let sum = 0
    for (let i = 0; i < size; i++) sum += Math.exp(row[i] - max)
    const logZ = max + Math.log(sum)
    const out = logProbs.subarray(t * columns.length, (t + 1) * columns.length)
    let blank = 0
    for (const i of blankIndex) blank += Math.exp(row[i] - logZ)
    out[0] = Math.log(blank)
    soundIndex.forEach((i, c) => (out[c + 1] = row[i] - logZ))
  }
  return { logProbs, frames, columns }
}

/** The Echo score (0–100) for a raw score: 100 at or above `full`, 0 at or below `zero`, linear in between. */
export function echoScore(raw: number, reference: ReferencePoints): number {
  const range = Math.max(reference.full - reference.zero, MIN_RANGE)
  return Math.round(100 * Math.min(1, Math.max(0, (raw - reference.zero) / range)))
}

/** Scores a recording against an Expression's expected sounds (see expectedSounds). */
export function scoreEcho(output: ModelOutput, expected: readonly ExpectedSound[], reference: ReferencePoints): EchoResult {
  const raw = rawScore(output, expected)
  if (raw.kind === 'not-heard') return raw
  return { kind: 'heard', score: echoScore(raw.raw, reference), raw: raw.raw, sounds: raw.sounds }
}

/** The raw score (average sound rating, 0–1) and each sound's rating, before mapping onto reference points. */
export function rawScore(
  output: ModelOutput,
  expected: readonly ExpectedSound[],
): { kind: 'heard'; raw: number; sounds: { sound: string; rating: number }[] } | { kind: 'not-heard'; reason: NotHeardReason } {
  const { frames, columns } = output
  if (frames < MIN_FRAMES) return { kind: 'not-heard', reason: 'too-short' }
  if (!heardAnySound(output)) return { kind: 'not-heard', reason: 'no-speech' }
  if (frames < expected.length) return { kind: 'not-heard', reason: 'too-short-for-sounds' }

  const column = (sound: string) => {
    const c = columns.indexOf(sound)
    if (c < 1) throw new Error(`The model has no sound ${sound}`)
    return c
  }
  const target = expected.map((e) => column(e.sound))
  const probs = Float64Array.from(output.logProbs, Math.exp)
  const logTarget = logLikelihood(probs, frames, columns.length, target)
  if (!Number.isFinite(logTarget)) return { kind: 'not-heard', reason: 'too-short-for-sounds' }
  /** P(sequence) / P(expected sequence). */
  const likelihood = (sequence: number[]) => Math.exp(logLikelihood(probs, frames, columns.length, sequence) - logTarget)

  const sounds = expected.map((e, u) => {
    // Compare the expected sound with every other sound in its place, and with no sound at all.
    const accepted = new Set([target[u], ...e.alternatives.map(column)])
    let right = 0
    let all = 0
    for (let c = 1; c < columns.length; c++) {
      const p = c === target[u] ? 1 : likelihood(target.map((x, i) => (i === u ? c : x)))
      all += p
      if (accepted.has(c)) right += p
    }
    const left = likelihood(target.filter((_, i) => i !== u))
    all += left
    if (e.optional) right += left
    return { sound: e.sound, rating: right / all }
  })
  const raw = sounds.reduce((sum, s) => sum + s.rating, 0) / sounds.length
  return { kind: 'heard', raw, sounds }
}

function heardAnySound({ logProbs, frames, columns }: ModelOutput): boolean {
  for (let t = 0; t < frames; t++) {
    const row = logProbs.subarray(t * columns.length, (t + 1) * columns.length)
    for (let c = 1; c < row.length; c++) if (row[c] > row[0]) return true
  }
  return false
}

/**
 * log P(sequence | recording) under CTC: the sum over every way of spreading the sequence across the frames, with
 * blanks allowed between sounds (and required between two identical sounds). Scaled per frame to avoid underflow.
 */
function logLikelihood(probs: Float64Array, frames: number, width: number, sequence: readonly number[]): number {
  const states = 2 * sequence.length + 1
  const labels = new Int32Array(states)
  sequence.forEach((c, i) => (labels[2 * i + 1] = c))
  let alpha = new Float64Array(states)
  let next = new Float64Array(states)
  alpha[0] = probs[0]
  if (states > 1) alpha[1] = probs[labels[1]]
  let logScale = 0
  const normalise = (a: Float64Array) => {
    let sum = 0
    for (let s = 0; s < states; s++) sum += a[s]
    if (sum === 0) return false
    for (let s = 0; s < states; s++) a[s] /= sum
    logScale += Math.log(sum)
    return true
  }
  if (!normalise(alpha)) return -Infinity
  for (let t = 1; t < frames; t++) {
    const row = t * width
    for (let s = 0; s < states; s++) {
      let a = alpha[s]
      if (s >= 1) a += alpha[s - 1]
      if (s >= 2 && s % 2 === 1 && labels[s] !== labels[s - 2]) a += alpha[s - 2]
      next[s] = a * probs[row + labels[s]]
    }
    ;[alpha, next] = [next, alpha]
    if (!normalise(alpha)) return -Infinity
  }
  const end = alpha[states - 1] + (states > 1 ? alpha[states - 2] : 0)
  return end > 0 ? Math.log(end) + logScale : -Infinity
}
