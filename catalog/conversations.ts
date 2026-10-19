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
    greet: { kind: 'reply', intent: 'Greet the clerk.', accepted: [{ expressionId: 'hello', next: 'maybe-heat' }], distractors: ['goodbye-staying'] },

    // Half the time the clerk offers to heat the kimbap.
    'maybe-heat': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'heat' },
        { weight: 1, next: 'maybe-bag' },
      ],
    },
    heat: { kind: 'line', expressionId: 'heat-up-heard', next: 'heat-reply' },
    'heat-reply': {
      kind: 'reply',
      intent: 'Ask them to heat it up.',
      accepted: [
        { expressionId: 'heat-it-up', next: 'wait' },
        { expressionId: 'its-okay', next: 'maybe-bag' },
        { expressionId: 'no', next: 'maybe-bag' },
      ],
      // 포장해 주세요 is "to go" in a restaurant.
      distractors: ['to-go'],
    },
    wait: { kind: 'line', expressionId: 'just-a-moment', next: 'maybe-bag' },

    // Half the time the clerk asks about a bag.
    'maybe-bag': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'bag' },
        { weight: 1, next: 'total' },
      ],
    },
    bag: { kind: 'line', expressionId: 'need-bag-heard', next: 'bag-reply' },
    'bag-reply': {
      kind: 'reply',
      intent: "Say you don't need a bag.",
      accepted: [
        { expressionId: 'no-bag', next: 'total' },
        { expressionId: 'no', next: 'total' },
        { expressionId: 'bag-please', next: 'bag-price' },
      ],
      distractors: ['receipt'],
    },
    'bag-price': { kind: 'line', expressionId: 'bag-price-heard', next: 'bag-price-catch' },
    'bag-price-catch': {
      kind: 'catch',
      expressionId: 'bag-price-heard',
      question: 'How much is a bag?',
      answer: '100 won',
      wrong: ['1,000 won', '10 won', 'Free'],
      next: 'total',
    },

    // The total, one of three.
    total: {
      kind: 'variant',
      options: [
        { weight: 1, next: 'price-3200' },
        { weight: 1, next: 'price-4500' },
        { weight: 1, next: 'price-6800' },
      ],
    },
    'price-3200': { kind: 'line', expressionId: 'price-3200-heard', next: 'catch-3200' },
    'catch-3200': { kind: 'catch', expressionId: 'price-3200-heard', question: 'How much is it?', answer: '3,200 won', wrong: ['2,300 won', '3,020 won', '32,000 won'], next: 'pay' },
    'price-4500': { kind: 'line', expressionId: 'price-4500-heard', next: 'catch-4500' },
    'catch-4500': { kind: 'catch', expressionId: 'price-4500-heard', question: 'How much is it?', answer: '4,500 won', wrong: ['5,400 won', '4,050 won', '45,000 won'], next: 'pay' },
    'price-6800': { kind: 'line', expressionId: 'price-6800-heard', next: 'catch-6800' },
    'catch-6800': { kind: 'catch', expressionId: 'price-6800-heard', question: 'How much is it?', answer: '6,800 won', wrong: ['8,600 won', '6,080 won', '68,000 won'], next: 'pay' },

    pay: {
      kind: 'reply',
      intent: 'Ask if you can pay by card.',
      accepted: [
        { expressionId: 'card-ok', next: 'insert-card' },
        { expressionId: 'pay-cash', next: 'change' },
      ],
      distractors: ['too-expensive'],
    },
    'insert-card': { kind: 'line', expressionId: 'insert-card-heard', next: 'maybe-points' },
    change: { kind: 'line', expressionId: 'change-heard', next: 'maybe-points' },

    // A third of the time the clerk asks for a points card.
    'maybe-points': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'points' },
        { weight: 2, next: 'receipt' },
      ],
    },

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
