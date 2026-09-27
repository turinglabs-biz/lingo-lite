// The Echo lab's own storage: attempts and settings on this phone, apart from Progress. Recordings are never kept.
import type { EchoModelId } from '../models.ts'

export type AttemptKind = 'careful' | 'mistake' | 'different'
export type Fairness = 'fair' | 'harsh' | 'generous'

export interface LabAttempt {
  id: string
  at: string
  tester: string
  model: EchoModelId
  backend: string
  expressionId: string
  kind: AttemptKind
  /** The Echo score, or null when not heard. */
  score: number | null
  notHeard: string | null
  raw: number | null
  sounds: [string, number][]
  scoreMs: number
  inferMs: number
  seconds: number
  fairness: Fairness | null
}

export interface ClipCheckRow {
  expressionId: string
  voice: string
  score: number | null
  raw: number | null
  inferMs: number
}

const KEYS = { attempts: 'echo-lab.attempts', tester: 'echo-lab.tester', model: 'echo-lab.model', on: 'echo-lab.on', clipCheck: 'echo-lab.clip-check' }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the lab keeps working, results just don't survive a reload.
  }
}

export const lab = {
  attempts: () => read<LabAttempt[]>(KEYS.attempts, []),
  addAttempt: (a: LabAttempt) => write(KEYS.attempts, [...lab.attempts(), a]),
  updateAttempt: (id: string, patch: Partial<LabAttempt>) => write(KEYS.attempts, lab.attempts().map((a) => (a.id === id ? { ...a, ...patch } : a))),
  clear: () => {
    write(KEYS.attempts, [])
    write(KEYS.clipCheck, [])
  },
  tester: () => read<string>(KEYS.tester, ''),
  setTester: (name: string) => write(KEYS.tester, name),
  model: () => read<EchoModelId>(KEYS.model, 'native'),
  setModel: (id: EchoModelId) => write(KEYS.model, id),
  /** Models the tester turned on (downloaded and allowed the mic). */
  on: () => read<EchoModelId[]>(KEYS.on, []),
  setOn: (id: EchoModelId, on: boolean) => write(KEYS.on, [...lab.on().filter((m) => m !== id), ...(on ? [id] : [])]),
  clipCheck: () => read<ClipCheckRow[]>(KEYS.clipCheck, []),
  setClipCheck: (rows: ClipCheckRow[]) => write(KEYS.clipCheck, rows),
}

/** Everything a tester pastes back for tuning. */
export function resultsText(extra: Record<string, unknown>): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), userAgent: navigator.userAgent, ...extra, attempts: lab.attempts(), clipCheck: lab.clipCheck() }, null, 1)
}
