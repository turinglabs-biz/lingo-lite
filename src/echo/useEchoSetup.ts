import { useEffect, useRef, useState } from 'react'
import { unloadModel } from './engine.ts'
import type { EchoModel } from './models.ts'
import { requestMicrophone } from './recorder.ts'
import { bytesToDownload, download, isDownloaded, remove, removeOutdated } from './store.ts'

export type EchoSetupState =
  | { kind: 'checking' }
  | { kind: 'off'; bytes: number; outdated: boolean }
  | { kind: 'downloading'; loaded: number; total: number }
  | { kind: 'needs-mic'; refused: boolean; asking?: boolean }
  | { kind: 'on' }
  | { kind: 'error'; message: string }

export interface EchoSwitch {
  /** Whether this switch was left on. */
  isOn: () => boolean | Promise<boolean>
  setOn: (on: boolean) => unknown
  /** Whether the other switch still needs the downloaded files, so turning this one off must keep them. */
  othersNeedFiles: () => boolean | Promise<boolean>
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err))

/**
 * Turning Echo on: download the model and engine (with progress), then ask for the microphone. Settings (Echo in the
 * main flow) and the Echo lab each have their own switch but share the downloaded files.
 */
export function useEchoSetup(model: EchoModel, echoSwitch: EchoSwitch) {
  const [setup, setSetup] = useState<EchoSetupState>({ kind: 'checking' })
  const sw = useRef(echoSwitch)
  sw.current = echoSwitch

  useEffect(() => {
    let live = true
    setSetup({ kind: 'checking' })
    ;(async () => {
      await removeOutdated()
      const [downloaded, wasOn] = await Promise.all([isDownloaded(model), sw.current.isOn()])
      if (!live) return
      if (downloaded && wasOn) return setSetup({ kind: 'on' })
      // Left on, but the files are gone (a new model was deployed or the phone cleared them).
      if (wasOn) await sw.current.setOn(false)
      const bytes = await bytesToDownload(model)
      if (live) setSetup({ kind: 'off', bytes, outdated: wasOn })
    })()
    return () => {
      live = false
    }
  }, [model])

  const lastProgress = useRef(0)
  async function turnOn() {
    try {
      await download(model, (loaded, total) => {
        const now = performance.now()
        if (loaded < total && now - lastProgress.current < 150) return
        lastProgress.current = now
        setSetup({ kind: 'downloading', loaded, total })
      })
      setSetup({ kind: 'needs-mic', refused: false })
    } catch (err) {
      setSetup({ kind: 'error', message: `The download stopped: ${message(err)}. Nothing was kept; try again.` })
    }
  }

  async function allowMic() {
    setSetup({ kind: 'needs-mic', refused: false, asking: true })
    if (!(await requestMicrophone())) return setSetup({ kind: 'needs-mic', refused: true })
    await sw.current.setOn(true)
    setSetup({ kind: 'on' })
  }

  async function turnOff() {
    await sw.current.setOn(false)
    if (!(await sw.current.othersNeedFiles())) {
      await unloadModel()
      await remove(model)
    }
    setSetup({ kind: 'off', bytes: await bytesToDownload(model), outdated: false })
  }

  return { setup, turnOn, allowMic, turnOff }
}
