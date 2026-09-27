import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { db } from '../db.ts'

const FocusContext = createContext<Set<string>>(new Set())

/** One live query of the Focus Expressions, shared by every pin on screen (the Phrasebook shows hundreds). */
export function FocusProvider({ children }: { children: ReactNode }) {
  const marks = useLiveQuery(() => db.focus.toArray(), [])
  const focus = useMemo(() => new Set((marks ?? []).map((m) => m.expressionId)), [marks])
  return <FocusContext.Provider value={focus}>{children}</FocusContext.Provider>
}

export const useFocus = () => useContext(FocusContext)
