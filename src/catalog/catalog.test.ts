import { describe, expect, it } from 'vitest'
import { expressions, topics } from '../../catalog/catalog.ts'
import { catalog } from './index.ts'
import { BATCH_SIZE, MAX_NUMBERS_PER_BATCH, catalogOrder } from './order.ts'
import { validateCatalog } from './validate.ts'

describe('Catalog', () => {
  it('is valid', () => {
    expect(validateCatalog(topics, catalog)).toEqual([])
  })

  it('orders every Expression exactly once', () => {
    expect(catalog).toHaveLength(expressions.length)
    expect(new Set(catalog.map((e) => e.id)).size).toBe(expressions.length)
  })

  it('introduces all tier 1 Expressions before any tier 2 (Numbers may carry over)', () => {
    const others = catalog.filter((e) => e.topic !== 'numbers')
    const lastTier1 = others.map((e) => e.tier).lastIndexOf(1)
    const firstTier2 = others.findIndex((e) => e.tier === 2)
    expect(lastTier1).toBeLessThan(firstTier2)
  })

  it('mixes Topics within the first Batch', () => {
    const topicsInFirstBatch = new Set(catalog.slice(0, BATCH_SIZE).map((e) => e.topic))
    expect(topicsInFirstBatch.size).toBeGreaterThanOrEqual(10)
  })
})

describe('catalogOrder', () => {
  it('spreads Numbers so no Batch exceeds the cap', () => {
    const t = [{ id: 'numbers', name: 'N' }, { id: 'food', name: 'F' }] as never
    const ex = [
      ...Array.from({ length: 10 }, (_, i) => ({ id: `n${i}`, topic: 'numbers', tier: 1 })),
      ...Array.from({ length: 50 }, (_, i) => ({ id: `f${i}`, topic: 'food', tier: 3 })),
    ].map((e) => ({ ...e, romanization: 'a', hangul: '아', english: 'a' })) as never
    const ordered = catalogOrder(t, ex)
    for (let i = 0; i < ordered.length; i += BATCH_SIZE) {
      expect(ordered.slice(i, i + BATCH_SIZE).filter((e) => e.topic === 'numbers').length).toBeLessThanOrEqual(MAX_NUMBERS_PER_BATCH)
    }
    expect(ordered).toHaveLength(60)
  })
})
