import { useEffect, useRef, useState } from 'react'
import { XP } from '../domain/progress.ts'
import type { Session, SessionType } from '../domain/types.ts'
import { finishSession, startSession } from '../progress/store.ts'

/** Starts a session record on mount and tallies what the summary shows. */
export function useSessionTracker(type: SessionType) {
  const [session, setSession] = useState<Session | null>(null)
  const started = useRef(false)
  const tally = useRef({ answers: 0, correct: 0, learned: [] as string[] })

  useEffect(() => {
    if (started.current) return
    started.current = true
    startSession(type).then(setSession)
  }, [type])

  return {
    sessionId: session?.id,
    countAnswer(correct: boolean) {
      tally.current.answers++
      if (correct) tally.current.correct++
    },
    countLearned(id: string) {
      tally.current.learned.push(id)
    },
    async finish() {
      if (session) await finishSession(session.id)
      const t = tally.current
      return { answers: t.answers, correct: t.correct, newlyLearned: t.learned, xp: t.answers * XP.answer + t.learned.length * XP.learned + XP.session }
    },
  }
}
