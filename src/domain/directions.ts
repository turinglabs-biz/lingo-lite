import type { Direction, DirectionCard } from './types.ts'

// Which Directions an Expression has. Every Expression has Speak, Listen and See, except Heard Expressions (what the
// learner only ever hears), which have only Listen.

type Kind = { heard?: boolean }

export const directionsOf = (e: Kind): Direction[] => (e.heard ? ['listen'] : ['speak', 'listen', 'see'])

/** The Direction that decides Learned and enters the schedule at introduction. */
export const learnedDirection = (e: Kind): Direction => (e.heard ? 'listen' : 'speak')

/**
 * The cards Progress schedules and counts. A Heard Expression's Speak and See cards (from before it became Heard) are
 * kept, so making it ordinary again restores them, but they are left out here.
 */
export function scheduledCards(cards: DirectionCard[], heard: Set<string>): DirectionCard[] {
  return heard.size ? cards.filter((c) => !heard.has(c.expressionId) || c.direction === 'listen') : cards
}
