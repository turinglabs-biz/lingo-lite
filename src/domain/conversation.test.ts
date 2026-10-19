import { describe, expect, it } from 'vitest'
import { conversations } from '../../catalog/conversations.ts'
import { catalog, expressionById } from '../catalog/index.ts'
import { isFluent } from './scheduler.ts'
import { canPlay, checkReply, conversationStatus, isClean, longestIntendedPath, scheduleAfterRun, pickVariant, prepareBatch, replyOptions, resolveVariants, validateConversation, walkIntended, type Conversation, type Turn } from './conversation.ts'

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

describe('Variants', () => {
  const store = conversations.find((c) => c.id === 'convenience-store')!

  it('take every way on over a few seeded runs of the Convenience store', () => {
    const variantTargets = Object.values(store.turns).flatMap((t) => (t.kind === 'variant' ? t.options.map((o) => o.next) : []))
    const seen = new Set<string>()
    for (let seed = 1; seed <= 30; seed++) walkIntended(store, seeded(seed)).forEach((id) => seen.add(id))
    // A way on is either visited itself or (when it is another Variant) resolved past.
    for (const target of variantTargets) expect(seen.has(resolveVariants(store, target, () => 0)) || seen.has(target), target).toBe(true)
    for (const price of ['price-3200', 'price-4500', 'price-6800']) expect(seen.has(price), price).toBe(true)
  })

  it('pick by weight', () => {
    const turn = { kind: 'variant' as const, options: [{ weight: 1, next: 'a' }, { weight: 3, next: 'b' }] }
    expect(pickVariant(turn, () => 0.2)).toBe('a')
    expect(pickVariant(turn, () => 0.3)).toBe('b')
    expect(pickVariant(turn, () => 0.99)).toBe('b')
  })

  it('make a run vary between seeds', () => {
    const runs = new Set([1, 2, 3, 4, 5, 6].map((seed) => walkIntended(store, seeded(seed)).join()))
    expect(runs.size).toBeGreaterThan(1)
  })

  it('count toward the longest intended path, used by the progress bar', () => {
    const longest = longestIntendedPath(store)
    for (let seed = 1; seed <= 20; seed++) expect(walkIntended(store, seeded(seed)).length).toBeLessThanOrEqual(longest)
  })
})

describe('Catch and Variant validation', () => {
  it('reports a Catch whose wrong answers include the right one, or repeat', () => {
    const c = fixture()
    c.turns.c = { kind: 'catch', expressionId: 'bag-price-heard', question: 'How much is a bag?', answer: '100 won', wrong: ['100 won', '10 won', '10 won'], next: 'end' }
    const problems = validateConversation(c, expressionById).join('\n')
    expect(problems).toMatch(/a wrong answer is the right one/)
    expect(problems).toMatch(/three different wrong answers/)
  })

  it('reports a Variant with one way on or a weight of zero', () => {
    const c = fixture()
    c.turns.a = { kind: 'variant', options: [{ weight: 0, next: 'b' }] }
    const problems = validateConversation(c, expressionById).join('\n')
    expect(problems).toMatch(/at least two ways on/)
    expect(problems).toMatch(/weights must be positive/)
  })
})

describe('Prepare', () => {
  const c = fixture()
  const order = catalog
  it('lets the learner play once every Reply Turn has an introduced accepted Reply', () => {
    expect(canPlay(c, new Set(), new Set())).toBe(false)
    expect(canPlay(c, new Set(['bag-please']), new Set())).toBe(true)
    expect(canPlay(c, new Set(['no-bag']), new Set())).toBe(true)
  })
  it('skips a Reply Turn whose accepted Replies are all Ignored', () => {
    expect(canPlay(c, new Set(), new Set(['no-bag', 'bag-please']))).toBe(true)
  })
  it('puts the Replies Play needs first, then the rest, in Catalog order', () => {
    const batch = prepareBatch(c, order, new Set(), new Set())
    expect(batch[0]).toBe('no-bag')
    expect(batch.sort()).toEqual(['bag-please', 'bag-price-heard', 'need-bag-heard', 'no-bag'].sort())
  })
  it('takes at most 15 and leaves out introduced and Ignored Expressions', () => {
    const store = conversations.find((x) => x.id === 'convenience-store')!
    const batch = prepareBatch(store, order, new Set(['hello']), new Set(['its-okay']))
    expect(batch.length).toBeLessThanOrEqual(15)
    expect(batch).not.toContain('hello')
    expect(batch).not.toContain('its-okay')
    const rest = prepareBatch(store, order, new Set([...batch, 'hello']), new Set(['its-okay']))
    expect(rest.some((id) => batch.includes(id))).toBe(false)
  })
  it('the needed Replies, once learned, make the Conversation playable', () => {
    const store = conversations.find((x) => x.id === 'convenience-store')!
    const batch = prepareBatch(store, order, new Set(), new Set())
    expect(canPlay(store, new Set(batch), new Set())).toBe(true)
  })
})

describe('The Conversation schedule', () => {
  const DAY = 86_400_000
  const clean = { missed: 0, textShown: false }

  it('starts with the first finished Guided run, and only Free runs grade it afterwards', () => {
    expect(scheduleAfterRun(undefined, 'x', { mode: 'free', ...clean }, 0)).toBeUndefined()
    const card = scheduleAfterRun(undefined, 'x', { mode: 'guided', ...clean }, 0)!
    expect(card.conversationId).toBe('x')
    expect(card.reps).toBe(1)
    expect(scheduleAfterRun(card, 'x', { mode: 'guided', ...clean }, DAY)).toBeUndefined()
    expect(scheduleAfterRun(card, 'x', { mode: 'free', ...clean }, card.due)!.reps).toBe(2)
  })

  it('brings a run with a slip back sooner than a clean one', () => {
    let card = scheduleAfterRun(undefined, 'x', { mode: 'guided', ...clean }, 0)!
    for (let i = 0; i < 3; i++) card = scheduleAfterRun(card, 'x', { mode: 'free', ...clean }, card.due)!
    const good = scheduleAfterRun(card, 'x', { mode: 'free', ...clean }, card.due)!
    const slip = scheduleAfterRun(card, 'x', { mode: 'free', missed: 1, textShown: false }, card.due)!
    expect(slip.due).toBeLessThan(good.due)
  })

  it('counts a run as clean with Repair, but not with text shown or a miss', () => {
    expect(isClean({ missed: 0, textShown: false })).toBe(true)
    expect(isClean({ missed: 0, textShown: true })).toBe(false)
    expect(isClean({ missed: 1, textShown: false })).toBe(false)
  })

  it('becomes Fluent once expected to be remembered for 7 days', () => {
    let card = scheduleAfterRun(undefined, 'x', { mode: 'guided', ...clean }, 0)!
    expect(isFluent(card)).toBe(false)
    for (let i = 0; i < 8 && !card.fluentAt; i++) card = scheduleAfterRun(card, 'x', { mode: 'free', ...clean }, card.due)!
    expect(isFluent(card)).toBe(true)
    expect(card.fluentAt).toBeDefined()
  })

  it('reads as Needs, Ready, Due, Played or Fluent', () => {
    const card = scheduleAfterRun(undefined, 'x', { mode: 'guided', ...clean }, 0)!
    expect(conversationStatus(undefined, false, 0)).toBe('needs')
    expect(conversationStatus(undefined, true, 0)).toBe('ready')
    expect(conversationStatus(card, true, card.due)).toBe('due')
    expect(conversationStatus(card, true, card.due - 1)).toBe('played')
    expect(conversationStatus({ ...card, stability: 30, due: 10 * DAY }, true, DAY)).toBe('fluent')
  })
})

describe('Free play options', () => {
  const turn = fixture().turns.b as Reply
  it('may offer two accepted Replies, those already met first', () => {
    for (let seed = 1; seed < 10; seed++) {
      const options = replyOptions(turn, 'shopping', catalog, new Set(), seeded(seed), 4, 'free', new Set(['bag-please']))
      expect(options).toHaveLength(4)
      expect(options).toContain('bag-please')
      expect(options).toContain('no-bag')
      expect(options).toContain('receipt')
    }
  })
})

describe('Every authored Conversation', () => {
  it('reaches every way on of every Variant over seeded runs', () => {
    for (const c of conversations) {
      const seen = new Set<string>()
      // Seeds spread out: a small seed's first draw is always near 0, so the first Variant would never vary.
      for (let seed = 1; seed <= 60; seed++) walkIntended(c, seeded(seed * 7919 + 13)).forEach((id) => seen.add(id))
      for (const t of Object.values(c.turns)) {
        if (t.kind !== 'variant') continue
        for (const o of t.options) {
          const reached = c.turns[o.next].kind === 'variant' ? true : seen.has(o.next) || c.turns[o.next].kind === 'end'
          expect(reached, `${c.id}: ${o.next}`).toBe(true)
        }
      }
    }
  })
})
