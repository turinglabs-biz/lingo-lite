import table from '../../catalog/echo-reference.json'
import type { EchoModelId } from './models.ts'
import type { ReferencePoints } from './scorer.ts'

type Table = Record<string, Record<string, ReferencePoints & { hash: string }>>

/** An Expression's reference points for a model (computed by scripts/echo-reference.ts). */
export function referencePoints(model: EchoModelId, expressionId: string): ReferencePoints | undefined {
  return (table as Table)[model]?.[expressionId]
}
