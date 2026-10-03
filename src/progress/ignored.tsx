import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { db } from '../db.ts'

const IgnoredContext = createContext<Set<string>>(new Set())

/** One live query of the Ignored Expressions, shared by every toggle and session on screen. */
export function IgnoredProvider({ children }: { children: ReactNode }) {
  const marks = useLiveQuery(() => db.ignored.toArray(), [])
  const ignored = useMemo(() => new Set((marks ?? []).map((m) => m.expressionId)), [marks])
  return <IgnoredContext.Provider value={ignored}>{children}</IgnoredContext.Provider>
}

export const useIgnored = () => useContext(IgnoredContext)
