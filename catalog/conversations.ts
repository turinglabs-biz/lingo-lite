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

// Too long for one run, the restaurant is two Conversations: ordering, and paying at the end of the meal.
const restaurantOrdering: Conversation = {
  id: 'restaurant-ordering',
  topic: 'food',
  title: 'Restaurant: ordering',
  setting: 'Lunch at a small Korean restaurant with a friend.',
  role: 'the server',
  start: 'how-many',
  turns: {
    'how-many': { kind: 'line', expressionId: 'how-many-heard', next: 'how-many-reply' },
    'how-many-reply': {
      kind: 'reply',
      intent: 'Say there are two of you.',
      accepted: [{ expressionId: 'two-people', next: 'sit' }],
      // 개 counts things, not people.
      distractors: ['two-of-them'],
    },
    sit: { kind: 'line', expressionId: 'sit-here-heard', next: 'menu' },
    menu: {
      kind: 'reply',
      intent: 'Ask for an English menu.',
      accepted: [
        { expressionId: 'english-menu', next: 'english-menu-answer' },
        { expressionId: 'menu-please', next: 'order' },
      ],
    },
    'english-menu-answer': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'here-it-is' },
        { weight: 1, next: 'no-english-menu' },
      ],
    },
    'here-it-is': { kind: 'line', expressionId: 'here-you-are', next: 'order' },
    'no-english-menu': { kind: 'line', expressionId: 'no-english-menu-heard', next: 'what-good' },
    'what-good': { kind: 'reply', intent: "Ask what's good.", accepted: [{ expressionId: 'what-is-good', next: 'popular' }], distractors: ['what-is-this'] },
    popular: { kind: 'line', expressionId: 'popular-heard', next: 'popular-catch' },
    'popular-catch': {
      kind: 'catch',
      expressionId: 'popular-heard',
      question: 'What do they recommend?',
      answer: 'The kimchi stew: it is the most popular',
      wrong: ['The kimchi stew is sold out', 'The kimchi stew is very spicy', 'Kimchi is free'],
      next: 'that-one',
    },
    'that-one': { kind: 'reply', intent: 'Order that.', accepted: [{ expressionId: 'that-one-please', next: 'maybe-spicy' }], distractors: ['this-one'] },
    order: { kind: 'line', expressionId: 'order-heard', next: 'order-reply' },
    'order-reply': {
      kind: 'reply',
      intent: 'Point at a dish and order one.',
      accepted: [
        { expressionId: 'one-of-this', next: 'maybe-spicy' },
        { expressionId: 'this-one-please', next: 'maybe-spicy' },
      ],
      distractors: ['one-more'],
    },

    'maybe-spicy': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'spicy' },
        { weight: 1, next: 'water' },
      ],
    },
    spicy: { kind: 'line', expressionId: 'spicy-heard', next: 'spicy-reply' },
    'spicy-reply': {
      kind: 'reply',
      intent: 'Ask for it not spicy.',
      accepted: [
        { expressionId: 'not-spicy', next: 'water' },
        { expressionId: 'yes', next: 'water' },
        { expressionId: 'is-it-spicy', next: 'little-spicy' },
      ],
    },
    'little-spicy': { kind: 'line', expressionId: 'little-spicy-heard', next: 'little-spicy-reply' },
    'little-spicy-reply': {
      kind: 'reply',
      intent: 'Ask for it not spicy.',
      accepted: [
        { expressionId: 'not-spicy', next: 'water' },
        { expressionId: 'its-okay', next: 'water' },
      ],
    },

    water: { kind: 'line', expressionId: 'water-self-heard', next: 'water-catch' },
    'water-catch': {
      kind: 'catch',
      expressionId: 'water-self-heard',
      question: 'What about water?',
      answer: 'You get it yourself',
      wrong: ["They'll bring it", 'It costs extra', "There isn't any"],
      next: 'call',
    },
    call: {
      kind: 'reply',
      intent: 'Later: call the server over.',
      accepted: [{ expressionId: 'excuse-me-attention', next: 'yes-sir' }],
      // 잠시만요 is for squeezing past someone, or "one moment".
      distractors: ['excuse-me-passing'],
    },
    'yes-sir': { kind: 'line', expressionId: 'yes-sir-heard', next: 'more' },
    more: {
      kind: 'reply',
      intent: 'Ask for more side dishes.',
      accepted: [
        { expressionId: 'more-side-dishes', next: 'more-answer' },
        { expressionId: 'water-please', next: 'more-answer' },
        { expressionId: 'one-more', next: 'more-answer' },
      ],
    },
    'more-answer': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'sides-self' },
        { weight: 1, next: 'bring-some' },
      ],
    },
    'sides-self': { kind: 'line', expressionId: 'sides-self-heard', next: 'end' },
    'bring-some': { kind: 'line', expressionId: 'bring-some-heard', next: 'end' },
    end: { kind: 'end' },
  },
}

const restaurantPaying: Conversation = {
  id: 'restaurant-paying',
  topic: 'food',
  title: 'Restaurant: paying',
  setting: "You've finished lunch with a friend and want to pay.",
  role: 'the server',
  start: 'call',
  turns: {
    call: { kind: 'reply', intent: 'Call the server over.', accepted: [{ expressionId: 'excuse-me-attention', next: 'yes-sir' }], distractors: ['excuse-me-passing'] },
    'yes-sir': { kind: 'line', expressionId: 'yes-sir-heard', next: 'bill' },
    bill: { kind: 'reply', intent: 'Ask for the bill.', accepted: [{ expressionId: 'bill-please', next: 'counter' }], distractors: ['menu-please'] },
    counter: { kind: 'line', expressionId: 'pay-counter-heard', next: 'counter-catch' },
    'counter-catch': {
      kind: 'catch',
      expressionId: 'pay-counter-heard',
      question: 'Where do you pay?',
      answer: 'At the counter',
      wrong: ['At the table', 'At the kiosk', 'Next time'],
      next: 'together',
    },
    together: { kind: 'line', expressionId: 'together-heard', next: 'together-reply' },
    'together-reply': {
      kind: 'reply',
      intent: "Say yes, it's all together.",
      accepted: [
        { expressionId: 'yes', next: 'total' },
        { expressionId: 'pay-separately', next: 'each' },
      ],
    },
    total: { kind: 'line', expressionId: 'price-23000-heard', next: 'total-catch' },
    'total-catch': { kind: 'catch', expressionId: 'price-23000-heard', question: 'How much is it?', answer: '23,000 won', wrong: ['32,000 won', '2,300 won', '20,300 won'], next: 'thanks' },
    each: { kind: 'line', expressionId: 'price-11500-heard', next: 'each-catch' },
    'each-catch': { kind: 'catch', expressionId: 'price-11500-heard', question: 'How much each?', answer: '11,500 won', wrong: ['15,100 won', '1,500 won', '11,050 won'], next: 'thanks' },
    thanks: {
      kind: 'reply',
      intent: 'Thank them for the meal.',
      accepted: [{ expressionId: 'after-meal', next: 'bye' }],
      // 잘 먹겠습니다 is said before eating.
      distractors: ['before-meal'],
    },
    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': {
      kind: 'reply',
      intent: "Say goodbye: you're the one leaving.",
      accepted: [
        { expressionId: 'goodbye-staying', next: 'end' },
        { expressionId: 'thank-you', next: 'end' },
      ],
      distractors: ['goodbye-leaving'],
    },
    end: { kind: 'end' },
  },
}

const taxi: Conversation = {
  id: 'taxi',
  topic: 'transport',
  title: 'Taxi',
  setting: 'You get into a taxi outside your hotel.',
  role: 'the driver',
  start: 'hello',
  turns: {
    hello: { kind: 'line', expressionId: 'hello', next: 'where-to' },
    'where-to': { kind: 'line', expressionId: 'where-to-heard', next: 'destination' },
    destination: {
      kind: 'reply',
      intent: 'Ask to go to Seoul Station.',
      accepted: [
        { expressionId: 'to-seoul-station', next: 'certainly' },
        { expressionId: 'to-this-address', next: 'certainly' },
      ],
      distractors: ['stop-here'],
    },
    certainly: { kind: 'line', expressionId: 'certainly-heard', next: 'how-long' },
    'how-long': { kind: 'reply', intent: 'Ask how long it takes.', accepted: [{ expressionId: 'how-long', next: 'twenty' }], distractors: ['is-it-far'] },
    twenty: { kind: 'line', expressionId: 'twenty-minutes-heard', next: 'twenty-catch' },
    'twenty-catch': {
      kind: 'catch',
      expressionId: 'twenty-minutes-heard',
      question: 'How long does it take?',
      answer: 'About 20 minutes',
      wrong: ['About 2 minutes', 'About 12 minutes', 'About 2 hours'],
      next: 'maybe-traffic',
    },
    'maybe-traffic': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'traffic' },
        { weight: 1, next: 'drop-off' },
      ],
    },
    traffic: { kind: 'line', expressionId: 'traffic-heard', next: 'traffic-reply' },
    'traffic-reply': { kind: 'reply', intent: "Say it's okay.", accepted: [{ expressionId: 'its-okay', next: 'drop-off' }] },
    'drop-off': { kind: 'line', expressionId: 'drop-off-heard', next: 'stop' },
    stop: {
      kind: 'reply',
      intent: 'Ask them to stop here.',
      accepted: [
        { expressionId: 'stop-here', next: 'fare' },
        { expressionId: 'over-there', next: 'fare' },
      ],
      // 쭉 가세요 is "keep going".
      distractors: ['go-straight'],
    },
    fare: { kind: 'line', expressionId: 'price-12000-heard', next: 'fare-catch' },
    'fare-catch': { kind: 'catch', expressionId: 'price-12000-heard', question: 'How much is the fare?', answer: '12,000 won', wrong: ['20,000 won', '2,000 won', '10,200 won'], next: 'pay' },
    pay: {
      kind: 'reply',
      intent: 'Ask if you can pay by card.',
      accepted: [
        { expressionId: 'card-ok', next: 'tap' },
        { expressionId: 'pay-cash', next: 'change' },
      ],
    },
    tap: { kind: 'line', expressionId: 'tap-card-heard', next: 'maybe-receipt' },
    change: { kind: 'line', expressionId: 'change-heard', next: 'maybe-receipt' },
    'maybe-receipt': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'receipt' },
        { weight: 2, next: 'bye' },
      ],
    },
    receipt: { kind: 'line', expressionId: 'receipt-heard', next: 'receipt-reply' },
    'receipt-reply': {
      kind: 'reply',
      intent: "Say you don't need it.",
      accepted: [
        { expressionId: 'its-okay', next: 'bye' },
        { expressionId: 'receipt', next: 'bye' },
        { expressionId: 'yes', next: 'bye' },
      ],
    },
    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': {
      kind: 'reply',
      intent: 'Thank the driver as you get out.',
      accepted: [
        { expressionId: 'thank-you', next: 'end' },
        { expressionId: 'keep-up-good-work', next: 'end' },
      ],
      distractors: ['goodbye-leaving'],
    },
    end: { kind: 'end' },
  },
}

const hotelCheckIn: Conversation = {
  id: 'hotel-check-in',
  topic: 'hotel',
  title: 'Hotel check-in',
  setting: 'You reach the front desk at 1 p.m.',
  role: 'the receptionist',
  start: 'hello',
  turns: {
    hello: { kind: 'line', expressionId: 'hello-formal-heard', next: 'greet' },
    greet: { kind: 'reply', intent: 'Greet them.', accepted: [{ expressionId: 'hello', next: 'check-in' }] },
    'check-in': { kind: 'reply', intent: "Say you'd like to check in.", accepted: [{ expressionId: 'check-in', next: 'reservation' }], distractors: ['check-out'] },
    reservation: { kind: 'line', expressionId: 'reservation-heard', next: 'reservation-reply' },
    'reservation-reply': {
      kind: 'reply',
      intent: 'Say you have a reservation.',
      accepted: [
        { expressionId: 'have-reservation', next: 'passport' },
        { expressionId: 'yes', next: 'passport' },
      ],
    },
    passport: { kind: 'line', expressionId: 'passport-heard', next: 'passport-reply' },
    'passport-reply': {
      kind: 'reply',
      intent: 'Hand it over.',
      accepted: [
        { expressionId: 'here-you-are', next: 'early-or-room' },
        { expressionId: 'yes', next: 'early-or-room' },
      ],
    },
    // Arriving early, or the room is ready.
    'early-or-room': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'from-three' },
        { weight: 1, next: 'room' },
      ],
    },
    'from-three': { kind: 'line', expressionId: 'checkin-from-three-heard', next: 'from-three-catch' },
    'from-three-catch': {
      kind: 'catch',
      expressionId: 'checkin-from-three-heard',
      question: 'When can you check in?',
      answer: 'From 3 o’clock',
      wrong: ['From 4 o’clock', 'From 10 o’clock', 'In 30 minutes'],
      next: 'luggage',
    },
    luggage: { kind: 'reply', intent: 'Ask them to keep your luggage.', accepted: [{ expressionId: 'keep-luggage', next: 'tag' }] },
    tag: { kind: 'line', expressionId: 'luggage-tag-heard', next: 'breakfast' },
    room: { kind: 'line', expressionId: 'room-heard', next: 'room-catch' },
    'room-catch': {
      kind: 'catch',
      expressionId: 'room-heard',
      question: 'Which room?',
      answer: 'Room 703, 7th floor',
      wrong: ['Room 307, 3rd floor', 'Room 730, 7th floor', 'Room 1703, 17th floor'],
      next: 'breakfast',
    },
    breakfast: { kind: 'reply', intent: 'Ask what time breakfast is.', accepted: [{ expressionId: 'breakfast-time', next: 'breakfast-answer' }], distractors: ['checkout-time'] },
    'breakfast-answer': { kind: 'line', expressionId: 'breakfast-heard', next: 'breakfast-catch' },
    'breakfast-catch': {
      kind: 'catch',
      expressionId: 'breakfast-heard',
      question: 'Breakfast is…',
      answer: 'On the 1st floor, 7 to 10',
      wrong: ['On the 7th floor, 1 to 10', 'On the 1st floor, 7 to 11', 'On the 10th floor, 7 to 10'],
      next: 'checkout',
    },
    checkout: { kind: 'reply', intent: 'Ask what time check-out is.', accepted: [{ expressionId: 'checkout-time', next: 'checkout-answer' }], distractors: ['breakfast-time'] },
    'checkout-answer': { kind: 'line', expressionId: 'checkout-heard', next: 'checkout-catch' },
    'checkout-catch': { kind: 'catch', expressionId: 'checkout-heard', question: 'Check-out is at…', answer: '11 o’clock', wrong: ['1 o’clock', '10 o’clock', '12 o’clock'], next: 'elevator' },
    elevator: { kind: 'line', expressionId: 'elevator-heard', next: 'thanks' },
    thanks: { kind: 'reply', intent: 'Thank them.', accepted: [{ expressionId: 'thank-you', next: 'end' }] },
    end: { kind: 'end' },
  },
}

const subway: Conversation = {
  id: 'subway',
  topic: 'transport',
  title: 'Finding your way in the subway',
  setting: 'At Seoul Station, heading for Myeongdong. You ask a station worker.',
  role: 'the station worker',
  start: 'call',
  turns: {
    call: { kind: 'reply', intent: "Get the worker's attention.", accepted: [{ expressionId: 'excuse-me-attention', next: 'go-ahead' }], distractors: ['excuse-me-passing'] },
    'go-ahead': { kind: 'line', expressionId: 'go-ahead-heard', next: 'how' },
    how: {
      kind: 'reply',
      intent: 'Point at Myeongdong on your map and ask how to get there.',
      accepted: [{ expressionId: 'how-do-i-get-here', next: 'line' }],
      // 여기서 세워 주세요 is for a taxi.
      distractors: ['stop-here'],
    },
    line: { kind: 'line', expressionId: 'line-four-heard', next: 'line-catch' },
    'line-catch': { kind: 'catch', expressionId: 'line-four-heard', question: 'Which line?', answer: 'Line 4', wrong: ['Line 3', 'Line 10', 'Line 1'], next: 'maybe-there' },
    'maybe-there': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'there' },
        { weight: 1, next: 'exit' },
      ],
    },
    there: { kind: 'line', expressionId: 'line-four-there-heard', next: 'exit' },
    exit: { kind: 'reply', intent: 'Ask which exit to take.', accepted: [{ expressionId: 'which-exit', next: 'exit-answer' }], distractors: ['which-line'] },
    'exit-answer': { kind: 'line', expressionId: 'exit-six-heard', next: 'exit-catch' },
    'exit-catch': { kind: 'catch', expressionId: 'exit-six-heard', question: 'Which exit?', answer: 'Exit 6', wrong: ['Exit 9', 'Exit 16', 'Exit 60'], next: 'thanks' },
    thanks: { kind: 'reply', intent: 'Thank them.', accepted: [{ expressionId: 'thank-you', next: 'announcement' }] },
    announcement: { kind: 'line', expressionId: 'announcement-heard', next: 'announcement-catch' },
    'announcement-catch': {
      kind: 'catch',
      expressionId: 'announcement-heard',
      question: 'On the train: what did you hear?',
      answer: 'This is Myeongdong; doors open on the right',
      wrong: ['Next is Myeongdong; doors on the left', 'This is Myeongdong; doors on the left', 'Change here for line 4'],
      next: 'end',
    },
    end: { kind: 'end' },
  },
}

const tMoney: Conversation = {
  id: 't-money',
  topic: 'transport',
  title: 'Topping up a T-money card',
  setting: 'At a convenience store counter, with your T-money card.',
  role: 'the clerk',
  start: 'welcome',
  turns: {
    welcome: { kind: 'line', expressionId: 'welcome-heard', next: 'top-up' },
    'top-up': { kind: 'reply', intent: 'Hand over your card and ask to top it up.', accepted: [{ expressionId: 'top-up', next: 'how-much' }], distractors: ['bill-please'] },
    'how-much': { kind: 'line', expressionId: 'how-much-top-up-heard', next: 'amount' },
    amount: {
      kind: 'reply',
      intent: 'Ask for 10,000 won.',
      accepted: [
        { expressionId: 'price-10000', next: 'pay' },
        { expressionId: 'price-50000', next: 'pay' },
      ],
      // 열 is a native number: never used for money.
      distractors: ['native-10'],
    },
    pay: {
      kind: 'reply',
      intent: 'Ask if you can pay by card.',
      accepted: [
        { expressionId: 'card-ok', next: 'cash-only' },
        { expressionId: 'pay-cash', next: 'topped-up' },
      ],
    },
    'cash-only': { kind: 'line', expressionId: 'top-up-cash-only-heard', next: 'cash-only-catch' },
    'cash-only-catch': {
      kind: 'catch',
      expressionId: 'top-up-cash-only-heard',
      question: 'What did they say?',
      answer: 'Top-ups are cash only',
      wrong: ['Cards cost extra', 'The machine is broken', 'Top-ups are free'],
      next: 'cash',
    },
    cash: {
      kind: 'reply',
      intent: "Say you'll pay in cash.",
      accepted: [
        { expressionId: 'pay-cash', next: 'topped-up' },
        { expressionId: 'atm-where', next: 'atm-there' },
      ],
    },
    'atm-there': { kind: 'line', expressionId: 'atm-there-heard', next: 'after-atm' },
    'after-atm': { kind: 'reply', intent: 'Back with cash: say you\'ll pay in cash.', accepted: [{ expressionId: 'pay-cash', next: 'topped-up' }] },
    'topped-up': { kind: 'line', expressionId: 'topped-up-heard', next: 'balance-catch' },
    'balance-catch': {
      kind: 'catch',
      expressionId: 'topped-up-heard',
      question: "What's your balance now?",
      answer: '12,000 won',
      wrong: ['10,000 won', '2,000 won', '20,000 won'],
      next: 'thanks',
    },
    thanks: { kind: 'reply', intent: 'Thank them.', accepted: [{ expressionId: 'thank-you', next: 'bye' }] },
    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': {
      kind: 'reply',
      intent: "Say goodbye: you're the one leaving.",
      accepted: [{ expressionId: 'goodbye-staying', next: 'end' }],
      distractors: ['goodbye-leaving'],
    },
    end: { kind: 'end' },
  },
}

const askingTheWay: Conversation = {
  id: 'asking-the-way',
  topic: 'directions',
  title: 'Asking the way',
  setting: "You're looking for the nearest subway station and stop a passer-by.",
  role: 'the passer-by',
  start: 'call',
  turns: {
    call: { kind: 'reply', intent: 'Get their attention.', accepted: [{ expressionId: 'excuse-me-attention', next: 'pardon' }], distractors: ['excuse-me-passing'] },
    pardon: { kind: 'line', expressionId: 'pardon', next: 'where' },
    where: {
      kind: 'reply',
      intent: 'Ask where the subway station is.',
      accepted: [
        { expressionId: 'station-where', next: 'answer' },
        { expressionId: 'how-do-i-get-here', next: 'answer' },
      ],
      distractors: ['bathroom-where'],
    },
    // Sometimes the passer-by doesn't know either.
    answer: {
      kind: 'variant',
      options: [
        { weight: 2, next: 'directions' },
        { weight: 1, next: 'dont-know' },
      ],
    },
    directions: { kind: 'line', expressionId: 'go-straight-right-heard', next: 'directions-catch' },
    'directions-catch': {
      kind: 'catch',
      expressionId: 'go-straight-right-heard',
      question: 'Which way?',
      answer: 'Straight, then right at the intersection',
      wrong: ['Right, then straight', 'Straight, then left', 'Back the way you came'],
      next: 'far',
    },
    far: {
      kind: 'reply',
      intent: 'Ask if it is far.',
      accepted: [
        { expressionId: 'is-it-far', next: 'five-minutes' },
        { expressionId: 'is-it-close', next: 'five-minutes' },
      ],
    },
    'five-minutes': { kind: 'line', expressionId: 'five-minutes-walk-heard', next: 'five-minutes-catch' },
    'five-minutes-catch': {
      kind: 'catch',
      expressionId: 'five-minutes-walk-heard',
      question: 'How far is it?',
      answer: 'About 5 minutes on foot',
      wrong: ['About 15 minutes', 'About 5 minutes by taxi', '5 stops'],
      next: 'thanks',
    },
    thanks: {
      kind: 'reply',
      intent: 'Thank them for their help.',
      accepted: [
        { expressionId: 'thanks-for-help', next: 'end' },
        { expressionId: 'thank-you', next: 'end' },
      ],
    },
    'dont-know': { kind: 'line', expressionId: 'dont-know-area-heard', next: 'dont-know-reply' },
    'dont-know-reply': {
      kind: 'reply',
      intent: "Say it's okay.",
      accepted: [
        { expressionId: 'its-okay', next: 'end' },
        { expressionId: 'thank-you', next: 'end' },
      ],
    },
    end: { kind: 'end' },
  },
}

const clothesShop: Conversation = {
  id: 'clothes-shop',
  topic: 'shopping',
  title: 'Clothes shop',
  setting: 'A small clothing shop in Myeongdong.',
  role: 'the shop assistant',
  // Trimmed to fit 20 Turns on its longest path: the greeting and goodbye are practised elsewhere.
  start: 'looking',
  turns: {
    looking: { kind: 'line', expressionId: 'looking-for-heard', next: 'looking-reply' },
    'looking-reply': { kind: 'reply', intent: "Say you're just looking.", accepted: [{ expressionId: 'just-looking', next: 'price' }], distractors: ['ill-take-this'] },
    price: { kind: 'reply', intent: 'Ask how much this is.', accepted: [{ expressionId: 'how-much', next: 'price-answer' }], distractors: ['what-is-this'] },
    'price-answer': { kind: 'line', expressionId: 'price-35000-heard', next: 'price-catch' },
    'price-catch': { kind: 'catch', expressionId: 'price-35000-heard', question: 'How much is it?', answer: '35,000 won', wrong: ['53,000 won', '3,500 won', '30,500 won'], next: 'try-on' },
    'try-on': { kind: 'reply', intent: 'Ask if you can try it on.', accepted: [{ expressionId: 'try-on', next: 'fitting-room' }], distractors: ['can-i-take-photo'] },
    'fitting-room': { kind: 'line', expressionId: 'fitting-room-heard', next: 'bigger' },
    bigger: { kind: 'reply', intent: 'Ask for a bigger one.', accepted: [{ expressionId: 'bigger-one', next: 'size' }], distractors: ['another-colour'] },
    size: {
      kind: 'variant',
      options: [
        { weight: 1, next: 'one-moment' },
        { weight: 1, next: 'sold-out' },
      ],
    },
    'one-moment': { kind: 'line', expressionId: 'excuse-me-passing', next: 'take-it' },
    'sold-out': { kind: 'line', expressionId: 'sold-out-heard', next: 'sold-out-catch' },
    'sold-out-catch': {
      kind: 'catch',
      expressionId: 'sold-out-heard',
      question: 'What did they say?',
      answer: 'That size is sold out',
      wrong: ["It's on sale", "It's in the back", "It's the last one"],
      next: 'colour',
    },
    colour: { kind: 'reply', intent: 'Ask for another colour.', accepted: [{ expressionId: 'another-colour', next: 'this-colour' }], distractors: ['bigger-one'] },
    'this-colour': { kind: 'line', expressionId: 'this-colour-heard', next: 'take-it' },
    'take-it': { kind: 'reply', intent: "Say you'll take it.", accepted: [{ expressionId: 'ill-take-this', next: 'tax-refund' }], distractors: ['too-expensive'] },
    'tax-refund': { kind: 'reply', intent: 'Ask about a tax refund.', accepted: [{ expressionId: 'tax-refund', next: 'passport' }] },
    passport: { kind: 'line', expressionId: 'passport-have-heard', next: 'passport-reply' },
    'passport-reply': { kind: 'reply', intent: 'Hand it over.', accepted: [{ expressionId: 'here-you-are', next: 'instalment' }] },
    instalment: { kind: 'line', expressionId: 'instalment-heard', next: 'instalment-reply' },
    'instalment-reply': {
      kind: 'reply',
      intent: 'Say yes: one payment.',
      accepted: [{ expressionId: 'yes', next: 'wrap' }],
      // 아니요 would ask for instalments.
      distractors: ['no'],
    },
    wrap: { kind: 'line', expressionId: 'gift-wrap-heard', next: 'wrap-reply' },
    'wrap-reply': {
      kind: 'reply',
      intent: 'Say no thanks.',
      accepted: [
        { expressionId: 'its-okay', next: 'end' },
        { expressionId: 'yes', next: 'end' },
      ],
      // 포장해 주세요 is taught as "to go" in a restaurant; here the shop's 포장 means gift wrap.
      distractors: ['to-go'],
    },
    end: { kind: 'end' },
  },
}

const marketStall: Conversation = {
  id: 'market-stall',
  topic: 'food',
  title: 'Market stall',
  setting: 'A hotteok stall in a traditional market.',
  role: 'the vendor',
  start: 'welcome',
  turns: {
    welcome: { kind: 'line', expressionId: 'welcome-heard', next: 'what' },
    what: { kind: 'line', expressionId: 'what-can-i-get-heard', next: 'what-is-this' },
    'what-is-this': { kind: 'reply', intent: 'Point and ask what this is.', accepted: [{ expressionId: 'what-is-this', next: 'hotteok' }], distractors: ['how-much'] },
    hotteok: { kind: 'line', expressionId: 'hotteok-heard', next: 'hotteok-catch' },
    'hotteok-catch': { kind: 'catch', expressionId: 'hotteok-heard', question: 'What is it like?', answer: "It's sweet", wrong: ["It's spicy", "It's sold out", "It's cold"], next: 'how-much' },
    'how-much': { kind: 'reply', intent: 'Ask how much.', accepted: [{ expressionId: 'how-much', next: 'each' }], distractors: ['what-is-this'] },
    each: { kind: 'line', expressionId: 'each-price-heard', next: 'each-catch' },
    'each-catch': { kind: 'catch', expressionId: 'each-price-heard', question: 'How much?', answer: '2,000 won each', wrong: ['2 for 1,000 won', '12,000 won', '2,000 won for all'], next: 'order' },
    order: {
      kind: 'reply',
      intent: 'Order two.',
      accepted: [{ expressionId: 'two-of-them', next: 'haggle' }],
      // 명 counts people.
      distractors: ['two-people'],
    },
    haggle: {
      kind: 'reply',
      intent: 'Ask for a discount.',
      accepted: [
        { expressionId: 'discount', next: 'two-for' },
        { expressionId: 'good', next: 'total' },
      ],
    },
    'two-for': { kind: 'line', expressionId: 'two-for-heard', next: 'two-for-catch' },
    'two-for-catch': { kind: 'catch', expressionId: 'two-for-heard', question: "What's the deal?", answer: 'Two for 3,500 won', wrong: ['Two for 5,300 won', 'Two for 2,500 won', 'Three for 3,500 won'], next: 'pay' },
    total: { kind: 'line', expressionId: 'price-4000-heard', next: 'pay' },
    pay: {
      kind: 'reply',
      intent: 'Ask if you can pay by card.',
      accepted: [
        { expressionId: 'card-ok', next: 'cash-only' },
        { expressionId: 'pay-cash', next: 'enjoy' },
      ],
    },
    'cash-only': { kind: 'line', expressionId: 'cash-only-heard', next: 'cash' },
    cash: {
      kind: 'reply',
      intent: "Say you'll pay in cash.",
      accepted: [
        { expressionId: 'pay-cash', next: 'enjoy' },
        { expressionId: 'atm-where', next: 'atm-there' },
      ],
    },
    'atm-there': { kind: 'line', expressionId: 'atm-there-heard', next: 'after-atm' },
    'after-atm': { kind: 'reply', intent: "Back with cash: say you'll pay in cash.", accepted: [{ expressionId: 'pay-cash', next: 'enjoy' }] },
    enjoy: { kind: 'line', expressionId: 'enjoy-heard', next: 'thanks' },
    thanks: {
      kind: 'reply',
      intent: 'Thank them before you eat.',
      accepted: [
        { expressionId: 'before-meal', next: 'end' },
        { expressionId: 'thank-you', next: 'end' },
      ],
      // 잘 먹었습니다 is for after the meal.
      distractors: ['after-meal'],
    },
    end: { kind: 'end' },
  },
}

const smallTalk: Conversation = {
  id: 'small-talk',
  topic: 'smalltalk',
  title: 'Small talk',
  setting: 'An older guest at your guesthouse starts chatting over breakfast.',
  role: 'the guest',
  start: 'where-from',
  turns: {
    'where-from': { kind: 'line', expressionId: 'where-from-heard', next: 'where-from-reply' },
    'where-from-reply': {
      kind: 'reply',
      intent: "Say you're from Europe.",
      accepted: [{ expressionId: 'from-europe', next: 'first-time' }],
      // 어디예요? asks where something is.
      distractors: ['where-is-it'],
    },
    'first-time': { kind: 'line', expressionId: 'first-time-heard', next: 'first-time-reply' },
    'first-time-reply': {
      kind: 'reply',
      intent: 'Say yes, it is your first time.',
      accepted: [
        { expressionId: 'first-time-korea', next: 'compliment' },
        { expressionId: 'yes', next: 'compliment' },
      ],
    },
    compliment: { kind: 'line', expressionId: 'korean-good-heard', next: 'compliment-reply' },
    'compliment-reply': {
      kind: 'reply',
      intent: 'Answer modestly.',
      accepted: [
        { expressionId: 'not-at-all', next: 'how-is-korea' },
        { expressionId: 'a-little-korean', next: 'how-is-korea' },
        { expressionId: 'thank-you', next: 'how-is-korea' },
      ],
      distractors: ['dont-speak-korean'],
    },
    'how-is-korea': { kind: 'line', expressionId: 'how-is-korea-heard', next: 'how-is-korea-reply' },
    'how-is-korea-reply': {
      kind: 'reply',
      intent: 'Say you really like Korea.',
      accepted: [
        { expressionId: 'like-korea', next: 'how-long' },
        { expressionId: 'its-fun', next: 'how-long' },
        { expressionId: 'the-best', next: 'how-long' },
      ],
      distractors: ['hungry'],
    },
    'how-long': { kind: 'line', expressionId: 'how-long-stay-heard', next: 'how-long-reply' },
    'how-long-reply': { kind: 'reply', intent: "Say you're staying for a month.", accepted: [{ expressionId: 'staying-a-month', next: 'photo' }], distractors: ['thirty-minutes'] },
    photo: {
      kind: 'reply',
      intent: 'Ask them to take a photo of you.',
      accepted: [{ expressionId: 'take-our-photo', next: 'one-more' }],
      // 사진 찍어도 돼요? asks if you may take a photo.
      distractors: ['can-i-take-photo'],
    },
    'one-more': { kind: 'line', expressionId: 'one-more-photo-heard', next: 'one-more-catch' },
    'one-more-catch': {
      kind: 'catch',
      expressionId: 'one-more-photo-heard',
      question: 'What did they say at the end?',
      answer: "They'll take one more",
      wrong: ["They're done", 'Smile', 'Move closer'],
      next: 'enjoy',
    },
    enjoy: { kind: 'line', expressionId: 'enjoy-trip-heard', next: 'thanks' },
    thanks: { kind: 'reply', intent: 'Thank them.', accepted: [{ expressionId: 'thank-you', next: 'end' }] },
    end: { kind: 'end' },
  },
}

const pharmacy: Conversation = {
  id: 'pharmacy',
  topic: 'health',
  title: 'Pharmacy',
  setting: "You've had a headache since yesterday.",
  role: 'the pharmacist',
  start: 'welcome',
  turns: {
    welcome: { kind: 'line', expressionId: 'welcome-heard', next: 'problem' },
    problem: { kind: 'line', expressionId: 'problem-heard', next: 'problem-reply' },
    'problem-reply': {
      kind: 'reply',
      intent: 'Say you have a headache.',
      accepted: [
        { expressionId: 'headache', next: 'since-when' },
        { expressionId: 'stomach-ache', next: 'since-when' },
        { expressionId: 'fever', next: 'since-when' },
        // Accepted, but vague: the pharmacist asks where.
        { expressionId: 'it-hurts', next: 'where-hurts' },
      ],
    },
    'where-hurts': { kind: 'line', expressionId: 'where-hurts-heard', next: 'where-hurts-reply' },
    'where-hurts-reply': {
      kind: 'reply',
      intent: 'Say your head hurts.',
      accepted: [
        { expressionId: 'headache', next: 'since-when' },
        { expressionId: 'stomach-ache', next: 'since-when' },
        { expressionId: 'fever', next: 'since-when' },
        { expressionId: 'it-hurts', next: 'where-hurts' },
      ],
    },
    'since-when': { kind: 'line', expressionId: 'since-when-heard', next: 'since-when-reply' },
    'since-when-reply': { kind: 'reply', intent: 'Say since yesterday.', accepted: [{ expressionId: 'since-yesterday', next: 'allergy' }], distractors: ['tomorrow'] },
    allergy: { kind: 'line', expressionId: 'allergy-heard', next: 'allergy-reply' },
    'allergy-reply': {
      kind: 'reply',
      intent: "Say you don't have any.",
      accepted: [
        { expressionId: 'there-isnt', next: 'dosage' },
        { expressionId: 'no', next: 'dosage' },
        { expressionId: 'peanut-allergy', next: 'medicine-ok' },
      ],
    },
    'medicine-ok': { kind: 'line', expressionId: 'medicine-ok-heard', next: 'dosage' },
    dosage: { kind: 'line', expressionId: 'dosage-heard', next: 'dosage-catch' },
    'dosage-catch': {
      kind: 'catch',
      expressionId: 'dosage-heard',
      question: 'How do you take it?',
      answer: '3 times a day, after meals',
      wrong: ['3 times a day, before meals', 'Once every 3 days', '3 tablets at once'],
      next: 'maybe-drowsy',
    },
    'maybe-drowsy': {
      kind: 'variant',
      options: [
        { weight: 1, next: 'drowsy' },
        { weight: 1, next: 'price' },
      ],
    },
    drowsy: { kind: 'line', expressionId: 'drowsy-heard', next: 'drowsy-catch' },
    'drowsy-catch': {
      kind: 'catch',
      expressionId: 'drowsy-heard',
      question: 'What should you know?',
      answer: 'It may make you drowsy',
      wrong: ['Take it with water', "Don't drink alcohol", 'Keep it cold'],
      next: 'price',
    },
    price: { kind: 'line', expressionId: 'price-5000-heard', next: 'thanks' },
    thanks: { kind: 'reply', intent: 'Thank them.', accepted: [{ expressionId: 'thank-you', next: 'bye' }] },
    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': { kind: 'reply', intent: "Say goodbye: you're the one leaving.", accepted: [{ expressionId: 'goodbye-staying', next: 'end' }], distractors: ['goodbye-leaving'] },
    end: { kind: 'end' },
  },
}

const hotelCheckOut: Conversation = {
  id: 'hotel-check-out',
  topic: 'hotel',
  title: 'Hotel check-out',
  setting: 'The morning you leave; your train is in the afternoon.',
  role: 'the receptionist',
  start: 'check-out',
  turns: {
    'check-out': { kind: 'reply', intent: "Say you'd like to check out.", accepted: [{ expressionId: 'check-out', next: 'key-card' }], distractors: ['check-in'] },
    'key-card': { kind: 'line', expressionId: 'key-card-heard', next: 'key-card-reply' },
    'key-card-reply': { kind: 'reply', intent: 'Hand it over.', accepted: [{ expressionId: 'here-you-are', next: 'minibar' }] },
    minibar: { kind: 'line', expressionId: 'minibar-heard', next: 'minibar-reply' },
    'minibar-reply': {
      kind: 'reply',
      intent: 'Say you didn\'t.',
      accepted: [
        { expressionId: 'no', next: 'luggage' },
        { expressionId: 'yes', next: 'luggage' },
      ],
    },
    luggage: { kind: 'reply', intent: 'Ask them to keep your luggage.', accepted: [{ expressionId: 'keep-luggage', next: 'back-when' }] },
    'back-when': { kind: 'line', expressionId: 'back-when-heard', next: 'back-when-reply' },
    'back-when-reply': { kind: 'reply', intent: "Say you'll be back at three.", accepted: [{ expressionId: 'three-oclock', next: 'tag' }], distractors: ['thirty-minutes'] },
    tag: { kind: 'line', expressionId: 'luggage-tag-heard', next: 'bye' },
    bye: { kind: 'line', expressionId: 'goodbye-leaving', next: 'bye-reply' },
    'bye-reply': { kind: 'reply', intent: "Say goodbye: you're the one leaving.", accepted: [{ expressionId: 'goodbye-staying', next: 'end' }], distractors: ['goodbye-leaving'] },
    end: { kind: 'end' },
  },
}

export const conversations: Conversation[] = [
  convenienceStore,
  cafe,
  restaurantOrdering,
  restaurantPaying,
  subway,
  taxi,
  hotelCheckIn,
  tMoney,
  askingTheWay,
  clothesShop,
  marketStall,
  smallTalk,
  pharmacy,
  hotelCheckOut,
]
