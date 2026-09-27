import type { Expression, Topic } from '../../catalog/catalog.ts'

export const BATCH_SIZE = 15
export const MAX_NUMBERS_PER_BATCH = 3

const byTier = (a: Expression, b: Expression) => a.tier - b.tier

/**
 * Derives the Catalog order. Non-Numbers Expressions go tier by tier, round-robin across Topics (one per
 * Topic per turn, in authored order). Numbers (a cluster of similar words that interfere when learned
 * together) are spread evenly through the whole sequence, in tier then authored order.
 */
export function catalogOrder(topics: Topic[], expressions: Expression[]): Expression[] {
  const others: Expression[] = []
  for (const tier of [1, 2, 3] as const) {
    const queues = topics
      .filter((t) => t.id !== 'numbers')
      .map((t) => expressions.filter((e) => e.topic === t.id && e.tier === tier))
    while (queues.some((q) => q.length > 0)) {
      for (const q of queues) if (q.length > 0) others.push(q.shift()!)
    }
  }
  const numbers = expressions.filter((e) => e.topic === 'numbers').sort(byTier)

  const total = others.length + numbers.length
  const spacing = total / Math.max(numbers.length, 1)
  const ordered: Expression[] = []
  let n = 0
  let o = 0
  for (let pos = 0; pos < total; pos++) {
    const numberDue = n < numbers.length && pos >= Math.floor(n * spacing + spacing / 2)
    if ((numberDue || o >= others.length) && n < numbers.length) ordered.push(numbers[n++])
    else ordered.push(others[o++])
  }
  return ordered
}
