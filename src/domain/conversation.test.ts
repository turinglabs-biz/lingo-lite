import { describe, expect, it } from 'vitest'
import { conversations } from '../../catalog/conversations.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { checkReply, replyOptions, validateConversation, type Conversation, type Turn } from './conversation.ts'

const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
type Reply = Extract<Turn, { kind: 'reply' }>

/** A small Conversation over real Catalog Expressions, to break on purpose. */
const fixture = (): Conversation => ({
  id: 'fixture',
  topic: 'shopping',
  title: 'Fixture',
  setting: 'A test.',
  role: 'the clerk',
  start: 'a',
  turns: {
    a: { kind: 'line', expressionId: 'need-bag-heard', next: 'b' },
    b: {
      kind: 'reply',
      intent: "Say you don't need a bag.",
      accepted: [
        { expressionId: 'no-bag', next: 'end' },
        { expressionId: 'bag-please', next: 'c' },
      ],
      distractors: ['receipt'],
    },
    c: { kind: 'line', expressionId: 'bag-price-heard', next: 'end' },
    end: { kind: 'end' },
  },
})

describe('validateConversation', () => {
  it('accepts every authored Conversation', () => {
    for (const c of conversations) expect(validateConversation(c, expressionById), c.id).toEqual([])
  })

  it('accepts the fixture as written', () => {
    expect(validateConversation(fixture(), expressionById)).toEqual([])
  })

  it('reports unknown Expressions and Turns', () => {
    const c = fixture()
    c.turns.a = { kind: 'line', expressionId: 'no-such-line', next: 'nowhere' }
    const problems = validateConversation(c, expressionById).join('\n')
    expect(problems).toMatch(/unknown Expression no-such-line/)
    expect(problems).toMatch(/next Turn nowhere doesn't exist/)
  })

  it('rejects a Heard Expression as a Reply or distractor', () => {
    const c = fixture()
    ;(c.turns.b as Reply).distractors = ['receipt-heard']
    expect(validateConversation(c, expressionById).join()).toMatch(/receipt-heard is a Heard Expression/)
  })

  it('rejects a distractor that is also accepted, and a Reply with nothing accepted', () => {
    const c = fixture()
    ;(c.turns.b as Reply).distractors = ['no-bag']
    expect(validateConversation(c, expressionById).join()).toMatch(/distractor no-bag is also accepted/)
    ;(c.turns.b as Reply).accepted = []
    expect(validateConversation(c, expressionById).join()).toMatch(/no accepted Reply/)
  })

  it('rejects unreachable Turns and Turns that never reach the End', () => {
    const c = fixture()
    c.turns.orphan = { kind: 'line', expressionId: 'welcome-heard', next: 'end' }
    c.turns.c = { kind: 'line', expressionId: 'bag-price-heard', next: 'c' }
    const problems = validateConversation(c, expressionById).join('\n')
    expect(problems).toMatch(/orphan: can't be reached/)
    expect(problems).toMatch(/c: never reaches the End/)
  })

  it('rejects an intended path longer than 20 Turns', () => {
    const turns: Conversation['turns'] = { end: { kind: 'end' } }
    for (let i = 0; i < 25; i++) turns[`t${i}`] = { kind: 'line', expressionId: 'welcome-heard', next: i === 24 ? 'end' : `t${i + 1}` }
    expect(validateConversation({ ...fixture(), start: 't0', turns }, expressionById).join()).toMatch(/doesn't end within 20/)
  })
})

describe('checkReply', () => {
  const turn = fixture().turns.b as Reply
  it('follows the branch of the accepted Reply picked', () => {
    expect(checkReply(turn, 'no-bag')).toEqual({ correct: true, next: 'end' })
    expect(checkReply(turn, 'bag-please')).toEqual({ correct: true, next: 'c' })
  })
  it('after a miss, shows the intended Reply and continues along its branch', () => {
    expect(checkReply(turn, 'receipt')).toEqual({ correct: false, next: 'end', expected: 'no-bag' })
  })
})

describe('replyOptions', () => {
  const turn = fixture().turns.b as Reply
  it('offers the intended Reply, the distractors, then the Topic, never another accepted one', () => {
    for (let seed = 1; seed < 20; seed++) {
      const options = replyOptions(turn, 'shopping', catalog, new Set(), seeded(seed))
      expect(options).toHaveLength(4)
      expect(options).toContain('no-bag')
      expect(options).toContain('receipt')
      expect(options).not.toContain('bag-please')
    }
  })
  it('never offers a Heard or Ignored Expression', () => {
    const heard = new Set(catalog.filter((e) => e.heard).map((e) => e.id))
    for (let seed = 1; seed < 20; seed++) {
      const options = replyOptions(turn, 'shopping', catalog, new Set(['receipt', 'how-much']), seeded(seed))
      expect(options.filter((id) => heard.has(id))).toEqual([])
      expect(options).not.toContain('receipt')
      expect(options).not.toContain('how-much')
    }
  })
})
