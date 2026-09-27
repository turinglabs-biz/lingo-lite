import { describe, expect, it } from 'vitest'
import { catalog } from '../catalog/index.ts'
import { ECHO_MODELS } from './models.ts'
import { expectedSounds } from './sounds.ts'

const vocabulary = ECHO_MODELS[0].vocabulary
const sounds = (romanization: string) => expectedSounds(romanization, vocabulary).map((s) => s.sound).join(' ')

describe('expectedSounds', () => {
  it('maps each syllable onto the model sounds', () => {
    expect(sounds('gam-sa-ham-ni-da')).toBe('G A M S A H A M N I D A')
    expect(sounds('maek-jju')).toBe('M E k JJ U')
    expect(sounds('gwaen-cha-na-yo')).toBe('G oE N CHh A N A iO')
    expect(sounds('ka-deu dwae-yo?')).toBe('Kh A D EU D oE iO')
  })

  it('drops intonation, so ne and ne? are the same sounds', () => {
    expect(sounds('ne?')).toBe(sounds('ne'))
  })

  it('makes a sound repeated across a syllable boundary one long sound', () => {
    expect(sounds('an-nyeong-ha-se-yo')).toBe('A N iEO NG H A S E iO')
    expect(sounds('mol-la-yo')).toBe('M O L A iO')
  })

  it('accepts a released or silent final stop at the end of a word, but not inside one', () => {
    const [, , p] = expectedSounds('bap', vocabulary)
    expect(p).toEqual({ sound: 'p', alternatives: ['Ph'], optional: true })
    const [, , k] = expectedSounds('maek-jju', vocabulary)
    expect(k).toEqual({ sound: 'k', alternatives: [], optional: false })
  })

  it('lets h be swallowed after a voiced sound, but not at the start', () => {
    const h = (romanization: string) => expectedSounds(romanization, vocabulary).find((s) => s.sound === 'H')!
    expect(h('gam-sa-ham-ni-da').optional).toBe(true)
    expect(h('an-nyeong-hi ga-se-yo').optional).toBe(true)
    expect(h('hwa-jang-sil').optional).toBe(false)
  })

  it('treats e and ye as the same vowel', () => {
    const [, e] = expectedSounds('ge-san-hae', vocabulary)
    expect(e.alternatives).toEqual(['iE'])
  })

  it('refuses syllables it cannot read and sounds the model lacks', () => {
    expect(() => expectedSounds('xyz', vocabulary)).toThrow(/Can't read/)
    expect(() => expectedSounds('ne', ['N'])).toThrow(/isn't in the model's vocabulary/)
  })

  it('converts every Expression in the Catalog for every model', () => {
    for (const model of ECHO_MODELS) {
      for (const e of catalog) expect(() => expectedSounds(e.romanization, model.vocabulary), `${model.id} ${e.id}`).not.toThrow()
    }
  })
})
