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

/** 'check' is the listen-and-pick check in a Learn session; it is objectively graded. */
export type AnswerKind = Direction | 'check'

export interface Answer {
  id?: number
  at: number
  sessionId: string
  expressionId: string
  kind: AnswerKind
  correct: boolean
  grade?: Grade
}

export type SessionType = 'learn' | 'review' | 'focus'

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
