// Conversations: scripted exchanges, one per everyday travel situation, in curated order (most frequent first). Every
// Turn refers to Catalog Expressions by id; the drafts and the reasoning behind each distractor are in
// .scratch/conversations/scripts.md. Checked by `npm run catalog:check` and the Conversation tests.
import type { Conversation } from '../src/domain/conversation.ts'

const convenienceStore: Conversation = {
  id: 'convenience-store',
  topic: 'shopping',
  title: 'Convenience store',
  setting: 'You put a triangle kimbap and a bottle of water on the counter.',
  role: 'the clerk',
  start: 'welcome',
  turns: {
    welcome: { kind: 'line', expressionId: 'welcome-heard', next: 'greet' },
    greet: { kind: 'reply', intent: 'Greet the clerk.', accepted: [{ expressionId: 'hello', next: 'heat' }], distractors: ['goodbye-staying'] },

    heat: { kind: 'line', expressionId: 'heat-up-heard', next: 'heat-reply' },
    'heat-reply': {
      kind: 'reply',
      intent: 'Ask them to heat it up.',
      accepted: [
        { expressionId: 'heat-it-up', next: 'wait' },
        { expressionId: 'its-okay', next: 'bag' },
        { expressionId: 'no', next: 'bag' },
      ],
      // 포장해 주세요 is "to go" in a restaurant.
      distractors: ['to-go'],
    },
    wait: { kind: 'line', expressionId: 'just-a-moment', next: 'bag' },

    bag: { kind: 'line', expressionId: 'need-bag-heard', next: 'bag-reply' },
    'bag-reply': {
      kind: 'reply',
      intent: "Say you don't need a bag.",
      accepted: [
        { expressionId: 'no-bag', next: 'pay' },
        { expressionId: 'no', next: 'pay' },
        { expressionId: 'bag-please', next: 'bag-price' },
      ],
      distractors: ['receipt'],
    },
    'bag-price': { kind: 'line', expressionId: 'bag-price-heard', next: 'pay' },

    pay: {
      kind: 'reply',
      intent: 'Ask if you can pay by card.',
      accepted: [
        { expressionId: 'card-ok', next: 'insert-card' },
        { expressionId: 'pay-cash', next: 'change' },
      ],
      distractors: ['too-expensive'],
    },
    'insert-card': { kind: 'line', expressionId: 'insert-card-heard', next: 'points' },
    change: { kind: 'line', expressionId: 'change-heard', next: 'points' },

    points: { kind: 'line', expressionId: 'points-card-heard', next: 'points-reply' },
    'points-reply': {
      kind: 'reply',
      intent: "Say you don't have one.",
      accepted: [
        { expressionId: 'there-isnt', next: 'receipt' },
        { expressionId: 'no', next: 'receipt' },
      ],
      // 있어요: you'd then be expected to hand one over.
      distractors: ['there-is'],
    },

    receipt: { kind: 'line', expressionId: 'receipt-heard', next: 'receipt-reply' },
    'receipt-reply': {
      kind: 'reply',
      intent: 'Ask them to throw it away.',
      accepted: [
        { expressionId: 'throw-it-away', next: 'bye' },
        { expressionId: 'its-okay', next: 'bye' },
        { expressionId: 'receipt', next: 'bye' },
        { expressionId: 'yes', next: 'bye' },
      ],
    },

    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': {
      kind: 'reply',
      intent: "Say goodbye — you're the one leaving.",
      accepted: [
        { expressionId: 'goodbye-staying', next: 'end' },
        { expressionId: 'thank-you', next: 'end' },
      ],
      // 안녕히 가세요 is said to someone who leaves; you leave and the clerk stays.
      distractors: ['goodbye-leaving'],
    },
    end: { kind: 'end' },
  },
}

export const conversations: Conversation[] = [convenienceStore]
