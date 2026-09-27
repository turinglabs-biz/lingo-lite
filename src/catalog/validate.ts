import type { Expression, Topic } from '../../catalog/catalog.ts'
import { BATCH_SIZE, MAX_NUMBERS_PER_BATCH } from './order.ts'

/** Returns a list of problems with the Catalog; empty means valid. `ordered` is the Catalog order. */
export function validateCatalog(topics: Topic[], ordered: Expression[]): string[] {
  const problems: string[] = []
  const topicIds = new Set(topics.map((t) => t.id))
  const seen = new Set<string>()

  for (const e of ordered) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) problems.push(`${e.id}: id must be kebab-case`)
    if (seen.has(e.id)) problems.push(`${e.id}: duplicate id`)
    seen.add(e.id)
    if (!topicIds.has(e.topic)) problems.push(`${e.id}: unknown topic ${e.topic}`)
    for (const field of ['romanization', 'hangul', 'english'] as const) {
      if (!e[field]?.trim()) problems.push(`${e.id}: missing ${field}`)
    }
    if (/[A-Z]/.test(e.romanization)) problems.push(`${e.id}: romanization must be lowercase`)
    if (!/[가-힣]/.test(e.hangul)) problems.push(`${e.id}: hangul contains no Korean syllables`)
    if (/--|- | -/.test(e.romanization)) problems.push(`${e.id}: malformed hyphenation`)
  }

  for (let i = 0; i < ordered.length; i += BATCH_SIZE) {
    const numbers = ordered.slice(i, i + BATCH_SIZE).filter((e) => e.topic === 'numbers').length
    if (numbers > MAX_NUMBERS_PER_BATCH) {
      problems.push(`Batch ${i / BATCH_SIZE + 1}: ${numbers} Numbers Expressions (max ${MAX_NUMBERS_PER_BATCH})`)
    }
  }
  return problems
}
