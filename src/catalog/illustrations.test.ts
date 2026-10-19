import { describe, expect, it } from 'vitest'
import { hasDrawing, illustrationOf, illustrationSiblings, illustrationSvg } from '../../catalog/illustrations.ts'
import { catalog } from './index.ts'

describe('Illustrations', () => {
  it('cover every Expression except Heard ones', () => {
    const missing = catalog.filter((e) => !e.heard && !illustrationSvg(e.id)).map((e) => e.id)
    expect(missing).toEqual([])
  })

  it('never belong to a Heard Expression (the learner never sees one as a picture prompt)', () => {
    expect(catalog.filter((e) => e.heard && illustrationSvg(e.id)).map((e) => e.id)).toEqual([])
  })

  it('only map known Expressions to existing drawings', () => {
    const ids = new Set(catalog.map((e) => e.id))
    for (const [id, key] of Object.entries(illustrationOf)) {
      expect(ids.has(id), `unknown Expression ${id}`).toBe(true)
      expect(hasDrawing(key), `unknown drawing ${key}`).toBe(true)
    }
  })

  it('are well-formed SVG', () => {
    for (const e of catalog.filter((e) => !e.heard)) {
      const svg = illustrationSvg(e.id)!
      expect(svg.startsWith('<svg viewBox="0 0 48 48"')).toBe(true)
      expect(svg).not.toMatch(/undefined|NaN/)
    }
  })

  it('list Expressions sharing a drawing as siblings', () => {
    expect(illustrationSiblings('thank-you').sort()).toEqual(['thank-you-2', 'thanks-soft'])
    expect(illustrationSiblings('beer')).toEqual([])
  })
})
