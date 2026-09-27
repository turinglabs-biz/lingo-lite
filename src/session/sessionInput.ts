import { createContext } from 'react'

/**
 * Records learner input in the current session, for Practice time (e.g. an Echo). Null outside sessions, such as in
 * the Phrasebook, where nothing changes Progress.
 */
export const SessionInput = createContext<(() => void) | null>(null)
