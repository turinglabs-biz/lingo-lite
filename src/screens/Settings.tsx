import { useState } from 'react'
import { resetProgress } from '../progress/store.ts'
import { updateSettings, useSettings } from '../settings.ts'

export function SettingsScreen({ onOpenEchoLab }: { onOpenEchoLab: () => void }) {
  const { hangulFirst } = useSettings()
  const [confirming, setConfirming] = useState(false)
  return (
    <section className="screen">
      <h1>Settings</h1>
      <ul className="list">
        <li>
          <label className="row toggle">
            <span>
              Show Hangul first
              <span className="muted small block">Romanization becomes the subtle line instead.</span>
            </span>
            <input id="hangul-first" type="checkbox" checked={hangulFirst} onChange={(e) => updateSettings({ hangulFirst: e.target.checked })} />
          </label>
        </li>
        <li>
          <button type="button" className="row" onClick={onOpenEchoLab}>
            <span>
              Echo lab
              <span className="muted small block">Test page: say an Expression back and get a score.</span>
            </span>
            <span className="muted" aria-hidden="true">
              ›
            </span>
          </button>
        </li>
        <li className="row danger-zone">
          <span>
            Reset Progress
            <span className="muted small block">Deletes all answers, schedules, Stars and stats on this device.</span>
          </span>
          {!confirming ? (
            <button type="button" className="danger" onClick={() => setConfirming(true)}>
              Reset
            </button>
          ) : (
            <span className="confirm">
              <button type="button" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger"
                onClick={async () => {
                  await resetProgress()
                  setConfirming(false)
                }}
              >
                Delete everything
              </button>
            </span>
          )}
        </li>
      </ul>
      <p className="muted small about">Lingo Lite · everything stays on this device.</p>
    </section>
  )
}
