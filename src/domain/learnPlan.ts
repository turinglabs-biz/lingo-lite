/** One step of a Learn session. */
export type LearnStep =
  | { kind: 'expose'; id: string }
  | { kind: 'check'; id: string; options: string[] }
  | { kind: 'speak'; id: string; round: number }

const GROUP_SIZE = 5
export const SPEAK_ROUNDS = 2

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Plans a Learn session for one Batch: groups of five are first shown (exposure with audio), then checked by
 * listen-and-pick; afterwards every Expression gets SPEAK_ROUNDS spaced Speak attempts. `optionPool` supplies
 * wrong answers for the check (Expression ids; the Batch itself when large enough).
 */
export function planLearnSession(ids: string[], optionPool: string[], random = Math.random): LearnStep[] {
  const steps: LearnStep[] = []
  for (let i = 0; i < ids.length; i += GROUP_SIZE) {
    const group = ids.slice(i, i + GROUP_SIZE)
    for (const id of group) steps.push({ kind: 'expose', id })
    for (const id of shuffle(group, random)) {
      const wrong = shuffle([...new Set([...ids, ...optionPool])].filter((x) => x !== id), random).slice(0, 3)
      steps.push({ kind: 'check', id, options: shuffle([id, ...wrong], random) })
    }
  }
  for (let round = 1; round <= SPEAK_ROUNDS; round++) {
    let order = shuffle(ids, random)
    // Avoid asking the same Expression twice in a row across the round boundary.
    const last = steps.at(-1)
    if (order.length > 1 && last && order[0] === last.id) order = [...order.slice(1), order[0]]
    for (const id of order) steps.push({ kind: 'speak', id, round })
  }
  return steps
}

/** A Speak attempt Missed in the last round earns one more attempt at the end (at most 3 per Expression). */
export function afterSpeakGrade(steps: LearnStep[], step: LearnStep, missed: boolean): LearnStep[] {
  if (step.kind !== 'speak' || !missed || step.round !== SPEAK_ROUNDS) return steps
  return [...steps, { kind: 'speak', id: step.id, round: SPEAK_ROUNDS + 1 }]
}
