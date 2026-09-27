import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useSettings } from '../settings.ts'
import { loadModel, type LoadedModel } from './engine.ts'
import { ECHO_MODEL } from './models.ts'
import { isDownloaded } from './store.ts'

/** Echo in the main flow: off, loading the model, or ready to score. */
export type EchoStatus = { kind: 'off' } | { kind: 'loading' } | { kind: 'ready'; model: LoadedModel }

const Context = createContext<{ status: EchoStatus; request: () => void }>({ status: { kind: 'off' }, request: () => {} })

/**
 * Loads the Echo model when Echo is on in Settings, but only once a screen with a mic button asks for it, so the app
 * starts as fast as before. The model then stays loaded while the app is open.
 */
export function EchoProvider({ children }: { children: ReactNode }) {
  const { echo } = useSettings()
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState<EchoStatus>({ kind: 'off' })
  const request = useCallback(() => setRequested(true), [])

  useEffect(() => {
    if (!echo || !requested) return setStatus({ kind: 'off' })
    let live = true
    setStatus({ kind: 'loading' })
    ;(async () => {
      try {
        // If the files are gone, Settings notices and offers the download again; until then Echo stays hidden.
        if (!(await isDownloaded(ECHO_MODEL))) throw new Error('The Echo model is not downloaded')
        const model = await loadModel(ECHO_MODEL)
        if (live) setStatus({ kind: 'ready', model })
      } catch (err) {
        console.warn('Echo: not available', err)
        if (live) setStatus({ kind: 'off' })
      }
    })()
    return () => {
      live = false
    }
  }, [echo, requested])

  return <Context.Provider value={{ status, request }}>{children}</Context.Provider>
}

/** The Echo status for a mic button; asks for the model to be loaded. */
export function useEchoStatus(): EchoStatus {
  const { status, request } = useContext(Context)
  useEffect(request, [request])
  return status
}
