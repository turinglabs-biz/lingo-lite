import { shuffle } from './choices.ts'
import { gradeConversationCard, isFluent, newConversationCard } from './scheduler.ts'
import type { ConversationCard, PlayMode } from './types.ts'

// Conversations: scripted exchanges in one everyday travel situation, in which the learner plays themself (see
// CONTEXT.md). A Conversation is a map of Turns; every Turn refers to Expressions by id.

export type TurnId = string

/** A Reply the Conversation accepts at a Turn, and where it leads. */
export interface Accepted {
  expressionId: string
  next: TurnId
}

export type Turn =
  /** The other person says an Expression (usually a Heard one). */
  | { kind: 'line'; expressionId: string; next: TurnId }
  /**
   * The learner says something. The first accepted Reply is the one the intent names (shown in Guided play), and the
   * one a miss continues along. Distractors are authored wrong answers that teach a real confusion.
   */
  | { kind: 'reply'; intent: string; accepted: Accepted[]; distractors?: string[] }
  /** The learner picks what they understood from a Line (a price, a time, an instruction) from four English options. */
  | { kind: 'catch'; expressionId: string; question: string; answer: string; wrong: [string, string, string]; next: TurnId }
  /** The other person may take one of several ways on; one is chosen at random each run, by weight. */
  | { kind: 'variant'; options: { weight: number; next: TurnId }[] }
  | { kind: 'end' }

export interface Conversation {
  id: string
  topic: string
  title: string
  /** One line of English setting the scene. */
  setting: string
  /** Who the learner talks to, e.g. "the clerk". */
  role: string
  start: TurnId
  turns: Record<TurnId, Turn>
}

/** The longest a Conversation may run when every Reply is the intended one. */
export const MAX_TURNS = 20

export interface Candidate {
  id: string
  topic: string
  heard?: boolean
}

/**
 * The four options for a Reply. Guided play offers the intended Reply. Free play (no intent) offers two accepted
 * Replies when there are two: the first the learner has met, and one other at random (met ones preferred), so every
 * branch can come up, each leading its own way. The rest are the authored distractors, then
 * other ordinary Expressions of the Conversation's Topic. Never an accepted Reply presented as wrong, never a Heard
 * Expression (the learner never says one), never an Ignored one.
 */
export function replyOptions(
  turn: Extract<Turn, { kind: 'reply' }>,
  topic: string,
  candidates: Candidate[],
  ignored: Set<string>,
  random = Math.random,
  count = 4,
  mode: PlayMode = 'guided',
  introduced: Set<string> = new Set(),
): string[] {
  const accepted = new Set(turn.accepted.map((a) => a.expressionId))
  const byId = new Map(candidates.map((c) => [c.id, c]))
  const usable = (id: string) => !accepted.has(id) && !ignored.has(id) && !byId.get(id)?.heard
  const open = turn.accepted.map((a) => a.expressionId).filter((id) => !ignored.has(id))
  const intended = open[0] ?? turn.accepted[0].expressionId
  const met = open.filter((id) => introduced.has(id))
  const ordered = [...met, ...open.filter((id) => !introduced.has(id))]
  const others = ordered.slice(1).filter((id) => met.length < 2 || met.includes(id))
  const right =
    mode === 'guided' || ordered.length < 2 ? [ordered[0] ?? intended] : [ordered[0], others[Math.floor(random() * others.length)] ?? ordered[1]]
  const wrong: string[] = []
  for (const id of shuffle((turn.distractors ?? []).filter(usable), random)) if (wrong.length < count - right.length) wrong.push(id)
  const fill = shuffle(
    candidates.filter((c) => c.topic === topic && usable(c.id) && !wrong.includes(c.id)),
    random,
  )
  for (const c of fill) if (wrong.length < count - right.length) wrong.push(c.id)
  return shuffle([...right, ...wrong], random)
}

export interface ReplyResult {
  correct: boolean
  /** Where the Conversation goes next: the picked Reply's branch, or the intended one's after a miss. */
  next: TurnId
  /** The Reply to show and play after a miss. */
  expected?: string
}

export function checkReply(turn: Extract<Turn, { kind: 'reply' }>, picked: string): ReplyResult {
  const hit = turn.accepted.find((a) => a.expressionId === picked)
  if (hit) return { correct: true, next: hit.next }
  return { correct: false, next: turn.accepted[0].next, expected: turn.accepted[0].expressionId }
}

/** Every Expression a Conversation uses, in order of first appearance along the Turns. */
export function expressionsOf(c: Conversation): string[] {
  const ids: string[] = []
  const add = (id: string) => !ids.includes(id) && ids.push(id)
  for (const t of Object.values(c.turns)) {
    if (t.kind === 'line' || t.kind === 'catch') add(t.expressionId)
    if (t.kind === 'reply') t.accepted.forEach((a) => add(a.expressionId))
  }
  return ids
}

function nextOf(t: Turn): TurnId[] {
  if (t.kind === 'line' || t.kind === 'catch') return [t.next]
  if (t.kind === 'reply') return t.accepted.map((a) => a.next)
  if (t.kind === 'variant') return t.options.map((o) => o.next)
  return []
}

/** Picks one of a Variant's ways on, by weight. */
export function pickVariant(turn: Extract<Turn, { kind: 'variant' }>, random = Math.random): TurnId {
  const total = turn.options.reduce((sum, o) => sum + o.weight, 0)
  let r = random() * total
  for (const o of turn.options) if ((r -= o.weight) < 0) return o.next
  return turn.options.at(-1)!.next
}

/** Follows Variants (choosing at random) until a Turn the learner sees: a Line, a Reply, a Catch or the end. */
export function resolveVariants(c: Conversation, id: TurnId, random = Math.random): TurnId {
  for (let n = 0; c.turns[id].kind === 'variant' && n < 100; n++) id = pickVariant(c.turns[id] as Extract<Turn, { kind: 'variant' }>, random)
  return id
}

/** The Turns one run visits when every Reply is the intended one, with Variants chosen at random (as in Watch). */
export function walkIntended(c: Conversation, random = Math.random): TurnId[] {
  const visited: TurnId[] = []
  let id = resolveVariants(c, c.start, random)
  while (c.turns[id].kind !== 'end' && visited.length <= MAX_TURNS * 2) {
    visited.push(id)
    const t = c.turns[id]
    id = resolveVariants(c, t.kind === 'reply' ? t.accepted[0].next : nextOf(t)[0], random)
  }
  return visited
}

/** The most Turns an intended run can take, over every Variant: for the progress bar. */
export function longestIntendedPath(c: Conversation): number {
  const longest = (id: TurnId, depth: number): number => {
    const t = c.turns[id]
    if (t.kind === 'end' || depth > MAX_TURNS * 2) return 0
    if (t.kind === 'variant') return Math.max(...t.options.map((o) => longest(o.next, depth)))
    return 1 + longest(t.kind === 'reply' ? t.accepted[0].next : nextOf(t)[0], depth + 1)
  }
  return longest(c.start, 0)
}

/** Returns a list of problems with a Conversation; empty means valid. */
export function validateConversation(c: Conversation, expressions: Map<string, { heard?: boolean }>): string[] {
  const problems: string[] = []
  const at = (id: TurnId) => `${c.id}/${id}`
  if (!c.turns[c.start]) problems.push(`${c.id}: start Turn ${c.start} doesn't exist`)
  for (const [id, t] of Object.entries(c.turns)) {
    for (const next of nextOf(t)) if (!c.turns[next]) problems.push(`${at(id)}: next Turn ${next} doesn't exist`)
    if ((t.kind === 'line' || t.kind === 'catch') && !expressions.has(t.expressionId)) problems.push(`${at(id)}: unknown Expression ${t.expressionId}`)
    if (t.kind === 'catch') {
      if (!t.question.trim() || !t.answer.trim()) problems.push(`${at(id)}: a Catch needs a question and an answer`)
      if (t.wrong.length !== 3 || new Set(t.wrong).size !== 3) problems.push(`${at(id)}: a Catch needs three different wrong answers`)
      if (t.wrong.includes(t.answer)) problems.push(`${at(id)}: a wrong answer is the right one`)
    }
    if (t.kind === 'variant') {
      if (t.options.length < 2) problems.push(`${at(id)}: a Variant needs at least two ways on`)
      if (t.options.some((o) => !(o.weight > 0))) problems.push(`${at(id)}: Variant weights must be positive`)
    }
    if (t.kind === 'reply') {
      if (t.accepted.length === 0) problems.push(`${at(id)}: no accepted Reply`)
      if (!t.intent.trim()) problems.push(`${at(id)}: no intent`)
      const accepted = new Set(t.accepted.map((a) => a.expressionId))
      for (const e of [...accepted, ...(t.distractors ?? [])]) {
        if (!expressions.has(e)) problems.push(`${at(id)}: unknown Expression ${e}`)
        else if (expressions.get(e)!.heard) problems.push(`${at(id)}: ${e} is a Heard Expression, which the learner never says`)
      }
      for (const d of t.distractors ?? []) if (accepted.has(d)) problems.push(`${at(id)}: distractor ${d} is also accepted`)
    }
  }
  if (problems.length) return problems

  // Every Turn is reachable from the start.
  const reached = new Set<TurnId>()
  const walk = (id: TurnId) => {
    if (reached.has(id)) return
    reached.add(id)
    nextOf(c.turns[id]).forEach(walk)
  }
  walk(c.start)
  for (const id of Object.keys(c.turns)) if (!reached.has(id)) problems.push(`${at(id)}: can't be reached from the start`)

  // Following the intended Reply everywhere (what a miss also does) reaches the End within MAX_TURNS, whichever way
  // each Variant goes.
  if (longestIntendedPath(c) > MAX_TURNS) problems.push(`${c.id}: the intended path doesn't end within ${MAX_TURNS} Turns`)
  // And every Turn can still reach the End (no branch is a dead loop).
  const canEnd = new Set(Object.keys(c.turns).filter((id) => c.turns[id].kind === 'end'))
  for (let changed = true; changed; ) {
    changed = false
    for (const [id, t] of Object.entries(c.turns)) {
      if (!canEnd.has(id) && nextOf(t).some((n) => canEnd.has(n))) {
        canEnd.add(id)
        changed = true
      }
    }
  }
  for (const id of Object.keys(c.turns)) if (!canEnd.has(id)) problems.push(`${at(id)}: never reaches the End`)
  return problems
}

const replyTurns = (c: Conversation) => Object.values(c.turns).filter((t): t is Extract<Turn, { kind: 'reply' }> => t.kind === 'reply')

/**
 * Whether the learner can play: every Reply Turn has at least one introduced, non-Ignored accepted Reply, so they're
 * never asked to say something they've never seen. A Turn whose accepted Replies are all Ignored doesn't count (it is
 * played as in Watch: shown, not asked).
 */
export function canPlay(c: Conversation, introduced: Set<string>, ignored: Set<string>): boolean {
  return replyTurns(c).every((t) => {
    const usable = t.accepted.filter((a) => !ignored.has(a.expressionId))
    return usable.length === 0 || usable.some((a) => introduced.has(a.expressionId))
  })
}

/** The Conversation's Expressions the learner hasn't met yet (Ignored ones left out), in Catalog order. */
export function newExpressionsOf(c: Conversation, ordered: { id: string }[], introduced: Set<string>, ignored: Set<string>): string[] {
  const used = new Set(expressionsOf(c))
  return ordered.map((e) => e.id).filter((id) => used.has(id) && !introduced.has(id) && !ignored.has(id))
}

/**
 * Prepare: up to `size` of the Conversation's not-yet-introduced, non-Ignored Expressions for a Learn session. First
 * the Replies Play needs (each Reply Turn's first usable accepted Reply, when none is introduced yet), then the rest
 * (Heard Expressions, other accepted Replies), each group in Catalog order.
 */
export function prepareBatch(c: Conversation, ordered: { id: string }[], introduced: Set<string>, ignored: Set<string>, size = 15): string[] {
  const needed = new Set<string>()
  for (const t of replyTurns(c)) {
    const usable = t.accepted.filter((a) => !ignored.has(a.expressionId))
    if (usable.length && !usable.some((a) => introduced.has(a.expressionId))) needed.add(usable[0].expressionId)
  }
  const fresh = newExpressionsOf(c, ordered, introduced, ignored)
  return [...fresh.filter((id) => needed.has(id)), ...fresh.filter((id) => !needed.has(id))].slice(0, size)
}

/** A clean run: no Missed Reply or Catch, and no text shown. Repair is allowed, as it would be in Korea. */
export const isClean = (run: { missed: number; textShown: boolean }) => run.missed === 0 && !run.textShown

/**
 * What a finished run does to the Conversation's schedule. The first finished Guided run puts it in the schedule;
 * after that only Free runs grade it (clean = Good, otherwise Missed). Guided practice afterwards changes nothing.
 * Returns the card to store, or undefined when nothing changes.
 */
export function scheduleAfterRun(
  card: ConversationCard | undefined,
  conversationId: string,
  run: { mode: PlayMode; missed: number; textShown: boolean },
  now: number,
): ConversationCard | undefined {
  if (card && run.mode === 'guided') return undefined
  if (!card && run.mode === 'free') return undefined
  return gradeConversationCard(card ?? newConversationCard(conversationId, now), isClean(run) ? 'good' : 'missed', now)
}

export type ConversationStatus = 'needs' | 'ready' | 'due' | 'played' | 'fluent'

/** Where a Conversation stands: needs Prepare, ready for a first Guided run, due, played (and waiting) or Fluent. */
export function conversationStatus(card: ConversationCard | undefined, playable: boolean, now: number): ConversationStatus {
  if (!playable) return 'needs'
  if (!card) return 'ready'
  if (card.due <= now) return 'due'
  return isFluent(card) ? 'fluent' : 'played'
}
