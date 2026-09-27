// Turns an Expression's Romanization into the sounds an Echo model should hear.
//
// The Echo models label Korean speech with the MFA phone set (G/Kh/GG for plain/aspirated/tense ㄱ, lowercase k/t/p
// for unreleased final stops, iA/oA/... for y- and w- diphthongs). The Romanization already spells what is actually
// said (ADR 0001: maek-jju, gam-sa-ham-ni-da), so each syllable maps straight onto those phones.

const ONSETS: Record<string, string> = {
  kk: 'GG', tt: 'DD', pp: 'BB', jj: 'JJ', ss: 'SS', ch: 'CHh',
  g: 'G', k: 'Kh', d: 'D', t: 'Th', b: 'B', p: 'Ph', j: 'J', s: 'S', h: 'H', m: 'M', n: 'N', r: 'R', l: 'L',
}

const VOWELS: Record<string, string> = {
  yeo: 'iEO', yae: 'iE', wae: 'oE', eo: 'EO', eu: 'EU', ae: 'E', ya: 'iA', yo: 'iO', yu: 'iU', ye: 'iE',
  wa: 'oA', we: 'oE', oe: 'oE', wo: 'uEO', wi: 'uI', ui: 'euI', a: 'A', e: 'E', i: 'I', o: 'O', u: 'U',
}

const CODAS: Record<string, string> = { ng: 'NG', k: 'k', t: 't', p: 'p', m: 'M', n: 'N', l: 'L' }

/** Final stops at the end of a word may be released (bap → B A Ph) or barely audible. */
const RELEASED: Record<string, string> = { k: 'Kh', t: 'Th', p: 'Ph' }

/** Sounds that end in voicing, after which h is usually swallowed (ji-ha-cheol → J I A CHh EO L). */
const VOICED = new Set(['M', 'N', 'NG', 'L', ...Object.values(VOWELS)])

/**
 * One expected sound. Saying any of `alternatives` instead, or leaving it out when `optional`, counts as right: these
 * are the ways natives actually say it that the Romanization doesn't spell.
 */
export interface ExpectedSound {
  sound: string
  alternatives: string[]
  optional: boolean
}

const alternation = (table: Record<string, string>) =>
  Object.keys(table)
    .sort((a, b) => b.length - a.length)
    .join('|')
const SYLLABLE = new RegExp(`^(${alternation(ONSETS)})?(${alternation(VOWELS)})(${alternation(CODAS)})?$`)

/**
 * The sounds of a Romanization, in the given model vocabulary. Intonation and punctuation are dropped (ne and ne? are
 * the same sounds), and a sound repeated across a syllable boundary is one long sound (an-nyeong → A N iEO NG).
 * Throws when a syllable doesn't parse or a sound isn't in the vocabulary.
 */
export function expectedSounds(romanization: string, vocabulary: readonly string[]): ExpectedSound[] {
  const known = new Set(vocabulary)
  const sounds: ExpectedSound[] = []
  const words = romanization
    .toLowerCase()
    .replace(/[?!.,…'"]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  for (const word of words) {
    const syllables = word.split('-').filter(Boolean)
    syllables.forEach((syllable, i) => {
      const m = SYLLABLE.exec(syllable)
      if (!m) throw new Error(`Can't read the syllable "${syllable}" in "${romanization}"`)
      const [, onset, vowel, coda] = m
      const wordEnd = i === syllables.length - 1
      const parts = [
        onset && { sound: ONSETS[onset], alternatives: [], optional: onset === 'h' && VOICED.has(sounds[sounds.length - 1]?.sound) },
        { sound: VOWELS[vowel], alternatives: vowel === 'e' || vowel === 'ae' ? ['iE'] : vowel === 'ye' || vowel === 'yae' ? ['E'] : [], optional: false },
        coda && { sound: CODAS[coda], alternatives: wordEnd && RELEASED[coda] ? [RELEASED[coda]] : [], optional: wordEnd && !!RELEASED[coda] },
      ]
      for (const part of parts) {
        if (!part) continue
        for (const s of [part.sound, ...part.alternatives]) {
          if (!known.has(s)) throw new Error(`The sound ${s} in "${romanization}" isn't in the model's vocabulary`)
        }
        if (sounds[sounds.length - 1]?.sound !== part.sound) sounds.push(part)
      }
    })
  }
  return sounds
}
