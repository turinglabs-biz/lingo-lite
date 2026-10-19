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


const cafe: Conversation = {
  id: 'cafe',
  topic: 'cafe',
  title: 'Café',
  setting: 'A small café where you order at the counter.',
  role: 'the barista',
  start: 'welcome',
  turns: {
    welcome: { kind: 'line', expressionId: 'welcome-heard', next: 'order' },
    order: { kind: 'line', expressionId: 'order-heard', next: 'order-reply' },
    'order-reply': {
      kind: 'reply',
      intent: 'Order an americano.',
      accepted: [
        { expressionId: 'americano', next: 'hot-or-iced' },
        // Saying iced up front skips the question.
        { expressionId: 'iced-americano', next: 'maybe-size' },
      ],
      distractors: ['bottle-of-water'],
    },
    'hot-or-iced': { kind: 'line', expressionId: 'hot-or-iced-heard', next: 'hot-or-iced-reply' },
    'hot-or-iced-reply': {
      kind: 'reply',
      intent: "Say you'd like it hot.",
      accepted: [
        { expressionId: 'hot-one', next: 'maybe-size' },
        { expressionId: 'iced', next: 'maybe-size' },
      ],
      distractors: ['milk'],
    },

    // Half the time the barista asks about the size.
    'maybe-size': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'size' },
        { weight: 1, next: 'for-here' },
      ],
    },
    size: { kind: 'line', expressionId: 'size-heard', next: 'size-reply' },
    'size-reply': {
      kind: 'reply',
      intent: 'Ask for a large.',
      accepted: [
        { expressionId: 'large-size', next: 'for-here' },
        { expressionId: 'regular-size', next: 'for-here' },
      ],
    },

    'for-here': { kind: 'line', expressionId: 'for-here-heard', next: 'for-here-reply' },
    'for-here-reply': {
      kind: 'reply',
      intent: "Say you'll take it with you.",
      accepted: [
        { expressionId: 'take-away', next: 'total' },
        { expressionId: 'to-go', next: 'total' },
        { expressionId: 'for-here', next: 'total' },
        { expressionId: 'eat-here', next: 'total' },
      ],
      distractors: ['hungry'],
    },

    total: {
      kind: 'variant',
      options: [
        { weight: 1, next: 'price-4000' },
        { weight: 1, next: 'price-4500' },
        { weight: 1, next: 'price-5500' },
      ],
    },
    'price-4000': { kind: 'line', expressionId: 'price-4000-heard', next: 'catch-4000' },
    'catch-4000': { kind: 'catch', expressionId: 'price-4000-heard', question: 'How much is it?', answer: '4,000 won', wrong: ['400 won', '14,000 won', '4,500 won'], next: 'insert-card' },
    'price-4500': { kind: 'line', expressionId: 'price-4500-heard', next: 'catch-4500' },
    'catch-4500': { kind: 'catch', expressionId: 'price-4500-heard', question: 'How much is it?', answer: '4,500 won', wrong: ['4,050 won', '5,400 won', '450 won'], next: 'insert-card' },
    'price-5500': { kind: 'line', expressionId: 'price-5500-heard', next: 'catch-5500' },
    'catch-5500': { kind: 'catch', expressionId: 'price-5500-heard', question: 'How much is it?', answer: '5,500 won', wrong: ['5,050 won', '15,500 won', '550 won'], next: 'insert-card' },
    'insert-card': { kind: 'line', expressionId: 'insert-card-heard', next: 'maybe-receipt' },

    // Half the time the barista offers the receipt.
    'maybe-receipt': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'receipt' },
        { weight: 1, next: 'buzzer' },
      ],
    },
    receipt: { kind: 'line', expressionId: 'receipt-heard', next: 'receipt-reply' },
    'receipt-reply': {
      kind: 'reply',
      intent: 'Ask them to throw it away.',
      accepted: [
        { expressionId: 'throw-it-away', next: 'buzzer' },
        { expressionId: 'its-okay', next: 'buzzer' },
        { expressionId: 'receipt', next: 'buzzer' },
        { expressionId: 'yes', next: 'buzzer' },
      ],
    },

    buzzer: { kind: 'line', expressionId: 'buzzer-heard', next: 'buzzer-catch' },
    'buzzer-catch': {
      kind: 'catch',
      expressionId: 'buzzer-heard',
      question: 'What do you do?',
      answer: 'Collect it at the counter when the buzzer goes off',
      wrong: ["Wait at your table; they'll bring it", 'Pay when the buzzer goes off', 'Come back in ten minutes'],
      next: 'buzzer-reply',
    },
    'buzzer-reply': {
      kind: 'reply',
      intent: 'Say you understand.',
      accepted: [
        { expressionId: 'got-it', next: 'wifi' },
        { expressionId: 'yes', next: 'wifi' },
      ],
    },
    wifi: {
      kind: 'reply',
      intent: 'Ask for the Wi-Fi password.',
      accepted: [
        { expressionId: 'wifi-password', next: 'wifi-answer' },
        { expressionId: 'thank-you', next: 'enjoy' },
      ],
      distractors: ['power-outlet'],
    },
    'wifi-answer': { kind: 'line', expressionId: 'wifi-on-receipt-heard', next: 'enjoy' },
    enjoy: { kind: 'line', expressionId: 'enjoy-heard', next: 'end' },
    end: { kind: 'end' },
  },
}

export const conversations: Conversation[] = [convenienceStore, cafe]
