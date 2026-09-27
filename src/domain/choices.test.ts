import { describe, expect, it } from 'vitest'
import { choiceOptions } from './choices.ts'

const c = (id: string, topic: string) => ({ id, topic })
const candidates = [c('t', 'food'), c('sib', 'food'), c('f1', 'food'), c('f2', 'food'), c('o1', 'cafe'), c('o2', 'cafe'), c('o3', 'hotel')]

describe('choiceOptions', () => {
  it('returns the target and three distinct distractors', () => {
    const options = choiceOptions(c('t', 'food'), candidates, new Set(['sib']), new Set())
    expect(options).toHaveLength(4)
    expect(new Set(options).size).toBe(4)
    expect(options).toContain('t')
  })

  it('never offers an Expression that shares the Illustration', () => {
    for (let i = 0; i < 20; i++) expect(choiceOptions(c('t', 'food'), candidates, new Set(['sib']), new Set())).not.toContain('sib')
  })

  it('prefers the same Topic, then introduced Expressions', () => {
    const options = choiceOptions(c('t', 'food'), candidates, new Set(['sib']), new Set(['o3']))
    expect(options).toEqual(expect.arrayContaining(['f1', 'f2', 'o3']))
  })
})
