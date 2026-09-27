import { describe, expect, it } from 'vitest'
import { catalog } from '../catalog/index.ts'
import { ECHO_MODELS } from './models.ts'
import { referencePoints } from './reference.ts'

describe('reference points', () => {
  it('cover every Expression for every model, with 100% above 0%', () => {
    for (const model of ECHO_MODELS) {
      for (const e of catalog) {
        const r = referencePoints(model.id, e.id)
        expect(r, `${model.id} ${e.id}`).toBeDefined()
        expect(r!.full, `${model.id} ${e.id}`).toBeGreaterThan(r!.zero)
      }
    }
  })
})
