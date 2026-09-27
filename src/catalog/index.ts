import { expressions, topics } from '../../catalog/catalog.ts'
import { catalogOrder } from './order.ts'

export type { Expression, Topic, TopicId } from '../../catalog/catalog.ts'
export { topics }

/** All Expressions in Catalog order. */
export const catalog = catalogOrder(topics, expressions)

export const expressionById = new Map(catalog.map((e) => [e.id, e]))
export const topicById = new Map(topics.map((t) => [t.id, t]))
