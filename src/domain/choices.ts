export function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface Candidate {
  id: string
  topic: string
}

/**
 * Four options for a question: the target plus three distractors. Expressions sharing the target's Illustration
 * mean the same thing, so they are never distractors (they would also be correct). Distractors come from the same Topic first, then from
 * `preferred` (e.g. already introduced Expressions), then from anything else.
 */
export function choiceOptions(
  target: Candidate,
  candidates: Candidate[],
  excluded: Set<string>,
  preferred: Set<string>,
  random = Math.random,
  count = 4,
): string[] {
  const pool = candidates.filter((c) => c.id !== target.id && !excluded.has(c.id))
  const tiers = [
    pool.filter((c) => c.topic === target.topic && preferred.has(c.id)),
    pool.filter((c) => c.topic === target.topic && !preferred.has(c.id)),
    pool.filter((c) => c.topic !== target.topic && preferred.has(c.id)),
    pool.filter((c) => c.topic !== target.topic && !preferred.has(c.id)),
  ]
  const distractors: string[] = []
  for (const tier of tiers) {
    for (const c of shuffle(tier, random)) {
      if (distractors.length === count - 1) break
      distractors.push(c.id)
    }
  }
  return shuffle([target.id, ...distractors], random)
}
