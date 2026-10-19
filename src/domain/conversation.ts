import { shuffle } from './choices.ts'

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
 * The four options for a Reply in Guided play: the intended Reply, the authored distractors, then other ordinary
 * Expressions of the Conversation's Topic. Never another accepted Reply (it would also be right), never a Heard
 * Expression (the learner never says one), never an Ignored one.
 */
export function replyOptions(
  turn: Extract<Turn, { kind: 'reply' }>,
  topic: string,
  candidates: Candidate[],
  ignored: Set<string>,
  random = Math.random,
  count = 4,
): string[] {
  const accepted = new Set(turn.accepted.map((a) => a.expressionId))
  const byId = new Map(candidates.map((c) => [c.id, c]))
  const usable = (id: string) => !accepted.has(id) && !ignored.has(id) && !byId.get(id)?.heard
  const target = turn.accepted.find((a) => !ignored.has(a.expressionId))?.expressionId ?? turn.accepted[0].expressionId
  const wrong: string[] = []
  for (const id of shuffle((turn.distractors ?? []).filter(usable), random)) if (wrong.length < count - 1) wrong.push(id)
  const fill = shuffle(
    candidates.filter((c) => c.topic === topic && usable(c.id) && !wrong.includes(c.id)),
    random,
  )
  for (const c of fill) if (wrong.length < count - 1) wrong.push(c.id)
  return shuffle([target, ...wrong], random)
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
    if (t.kind === 'line') add(t.expressionId)
    if (t.kind === 'reply') t.accepted.forEach((a) => add(a.expressionId))
  }
  return ids
}

const nextOf = (t: Turn): TurnId[] => (t.kind === 'line' ? [t.next] : t.kind === 'reply' ? t.accepted.map((a) => a.next) : [])

/** Returns a list of problems with a Conversation; empty means valid. */
export function validateConversation(c: Conversation, expressions: Map<string, { heard?: boolean }>): string[] {
  const problems: string[] = []
  const at = (id: TurnId) => `${c.id}/${id}`
  if (!c.turns[c.start]) problems.push(`${c.id}: start Turn ${c.start} doesn't exist`)
  for (const [id, t] of Object.entries(c.turns)) {
    for (const next of nextOf(t)) if (!c.turns[next]) problems.push(`${at(id)}: next Turn ${next} doesn't exist`)
    if (t.kind === 'line' && !expressions.has(t.expressionId)) problems.push(`${at(id)}: unknown Expression ${t.expressionId}`)
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

  // Following the intended Reply everywhere (what a miss also does) reaches the End within MAX_TURNS.
  let id = c.start
  for (let n = 0; ; n++) {
    const t = c.turns[id]
    if (t.kind === 'end') break
    if (n >= MAX_TURNS) {
      problems.push(`${c.id}: the intended path doesn't end within ${MAX_TURNS} Turns`)
      break
    }
    id = nextOf(t)[0]
  }
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
