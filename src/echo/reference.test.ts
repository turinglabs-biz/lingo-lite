import { describe, expect, it } from 'vitest'
import manifest from '../../catalog/audio-manifest.json'
import { catalog } from '../catalog/index.ts'
import { ECHO_MODELS } from './models.ts'
import { referencePoints } from './reference.ts'

// Reference points are measured from the Voices' Clips (`npm run echo:reference`), so they exist only for Expressions
// whose Clips are generated (`audio:check` reports any that aren't). Heard Expressions are never echoed.
const withClips = new Set(Object.keys(manifest).map((k) => k.split('/')[1]))

describe('reference points', () => {
  it('cover every echoable Expression with Clips, for every model, with 100% above 0%', () => {
    for (const model of ECHO_MODELS) {
      for (const e of catalog.filter((e) => !e.heard && withClips.has(e.id))) {
        const r = referencePoints(model.id, e.id)
        expect(r, `${model.id} ${e.id}`).toBeDefined()
        expect(r!.full, `${model.id} ${e.id}`).toBeGreaterThan(r!.zero)
      }
    }
  })
})
