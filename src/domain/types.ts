/** One way of practising an Expression, with its own schedule. */
export type Direction = 'speak' | 'listen' | 'see'

/** The outcome of one answer, checked by the app. */
export type Grade = 'missed' | 'good'

/** A Direction's spaced-repetition state (FSRS card fields, with dates as epoch ms so they can be indexed). */
export interface DirectionCard {
  /** `${expressionId}:${direction}` */
  key: string
  expressionId: string
  direction: Direction
  due: number
  stability: number
  difficulty: number
  scheduledDays: number
  learningSteps: number
  reps: number
  lapses: number
  state: number
  lastReview?: number
  /** First time the Expression became Learned (Speak only); XP is awarded once. */
  learnedAt?: number
}

/**
 * 'check' is the listen-and-pick check in a Learn session; 'reply' and 'catch' are a Reply and a Catch in a
 * Conversation. All are objectively graded, and none touches the schedule.
 */
export type AnswerKind = Direction | 'check' | 'reply' | 'catch'

export interface Answer {
  id?: number
  at: number
  sessionId: string
  expressionId: string
  kind: AnswerKind
  correct: boolean
  grade?: Grade
  /** For a Conversation answer: which Conversation and Turn. */
  conversationId?: string
  turnId?: string
}

export type SessionType = 'learn' | 'review' | 'focus' | 'conversation'

export interface Session {
  id: string
  type: SessionType
  startedAt: number
  /** Set when the session was finished (not abandoned). */
  endedAt?: number
  practiceMs: number
  lastInputAt: number
}

export interface Introduction {
  expressionId: string
  at: number
}

export interface TopicStars {
  topic: string
  stars: number
}

/** The spaced-repetition fields every schedule shares (FSRS, with dates as epoch ms). */
export type ScheduleFields = Pick<DirectionCard, 'due' | 'stability' | 'difficulty' | 'scheduledDays' | 'learningSteps' | 'reps' | 'lapses' | 'state' | 'lastReview'>

/** A Conversation's own schedule: whole exchanges come back by spaced repetition, separately from Expressions. */
export interface ConversationCard extends ScheduleFields {
  conversationId: string
  /** First time the Conversation became Fluent. */
  fluentAt?: number
}

export type PlayMode = 'guided' | 'free'

/** One finished run of a Conversation. */
export interface ConversationRun {
  id?: number
  conversationId: string
  sessionId: string
  mode: PlayMode
  startedAt: number
  endedAt: number
  missed: number
  textShown: boolean
  repairs: number
}

/** An Expression the learner put in Focus, and when. */
export interface FocusMark {
  expressionId: string
  at: number
}

/** An Expression the learner marked Ignored, and when. */
export interface IgnoredMark {
  expressionId: string
  at: number
}
