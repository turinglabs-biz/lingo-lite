// The Echo candidate models (ADR 0004). Both are slplab's Korean phone recognisers (Apache-2.0), converted to ONNX
// with 4-bit weights by scripts/echo-export.py and attached to a GitHub Release of this repo. The build downloads
// them from there at pinned checksums and serves them from our own server; learners never download from GitHub.

export type EchoModelId = 'native' | 'learner'

export interface EchoModel {
  id: EchoModelId
  name: string
  description: string
  /** The original PyTorch model on Hugging Face, which the ONNX file is converted from. */
  source: { repo: string; revision: string }
  /** The converted file the app downloads and runs. */
  file: { bytes: number; sha256: string }
  /** Output tokens by index. Outputs past the end (start/end tokens) count as blank. */
  vocabulary: readonly string[]
  blankTokens: readonly string[]
  sampleRate: number
}

const MFA_SOUNDS = ['A', 'B', 'BB', 'CHh', 'D', 'DD', 'E', 'EO', 'EU', 'G', 'GG', 'H', 'I', 'J', 'JJ', 'Kh', 'L', 'M', 'N', 'NG', 'O', 'Ph', 'R', 'S', 'SS', 'Th', 'U']

export const ECHO_MODELS: readonly EchoModel[] = [
  {
    id: 'native',
    name: 'Native speech',
    description: 'Trained on 108 hours of native Korean read speech.',
    source: { repo: 'slplab/wav2vec2-xls-r-300m_phone-mfa_korean', revision: 'e26ff9dfb62169acf445d0060ef56863c018b20e' },
    file: { bytes: 241_257_227, sha256: 'd9baafb5897f783207beef2819c955eb25156875e970f05a3e09105babe0b338' },
    vocabulary: [...MFA_SOUNDS, 'euI', 'iA', 'iE', 'iEO', 'iO', 'iU', 'k', 'oA', 'oE', 'p', 't', 'uEO', 'uI', '|', '[UNK]', '[PAD]'],
    blankTokens: ['|', '[UNK]', '[PAD]'],
    sampleRate: 16_000,
  },
  {
    id: 'learner',
    name: 'Learner speech',
    description: 'Trained on 10 hours of Korean spoken by learners from Asian countries.',
    source: { repo: 'slplab/wav2vec2-xls-r-300m_phoneme-mfa_korean_nia13-asia-9634_001', revision: 'b83432f0b06c1c07668250ac11b701cc4a1bd856' },
    file: { bytes: 241_257_227, sha256: '129aeed03b7ea66a96adb58cee22fca86df11db468efe5eda2cebb43a62762e5' },
    vocabulary: [...MFA_SOUNDS, 'UE', 'euI', 'iA', 'iE', 'iEO', 'iO', 'iU', 'k', 'oA', 'oE', 'p', 't', 'uEO', '|', '[UNK]', '[PAD]'],
    blankTokens: ['|', '[UNK]', '[PAD]'],
    sampleRate: 16_000,
  },
]

export const echoModelById = new Map(ECHO_MODELS.map((m) => [m.id, m]))

/**
 * The GitHub Release holding the converted files. Never replace a file there in place: builds pin its sha256. A new
 * or re-converted model goes into a new release (echo-models-2, …); see the README's Echo section.
 */
export const ECHO_RELEASE_URL = 'https://github.com/turinglabs-biz/lingo-lite/releases/download/echo-models-1'

/** A model's file name: its id plus the start of its sha256, so a changed file always gets a new name and URL. */
export const modelFileName = (m: EchoModel) => `${m.id}-${m.file.sha256.slice(0, 8)}.onnx`

/** Where a model is served from, relative to the app's base URL. */
export const modelPath = (m: EchoModel) => `models/${modelFileName(m)}`

/** Where the build downloads a model from. */
export const modelReleaseUrl = (m: EchoModel) => `${ECHO_RELEASE_URL}/${modelFileName(m)}`

/**
 * Normalises a recording the way the models were trained: zero mean, unit variance (wav2vec2's feature extractor).
 */
export function normaliseAudio(samples: Float32Array): Float32Array {
  let mean = 0
  for (const x of samples) mean += x
  mean /= samples.length || 1
  let variance = 0
  for (const x of samples) variance += (x - mean) ** 2
  variance /= samples.length || 1
  const sd = Math.sqrt(variance + 1e-7)
  return Float32Array.from(samples, (x) => (x - mean) / sd)
}
