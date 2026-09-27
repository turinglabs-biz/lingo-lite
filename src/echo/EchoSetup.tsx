import type { ReactNode } from 'react'
import type { EchoSetupState } from './useEchoSetup.ts'

const mb = (bytes: number) => `${Math.round(bytes / 1e6)} MB`

/** The steps of turning Echo on (see useEchoSetup). `status` is shown once Echo is on. */
export function EchoSetup({
  setup,
  onTurnOn,
  onAllowMic,
  onTurnOff,
  status = 'Echo is on.',
  actions,
}: {
  setup: EchoSetupState
  onTurnOn: () => void
  onAllowMic: () => void
  onTurnOff: () => void
  status?: ReactNode
  actions?: ReactNode
}) {
  switch (setup.kind) {
    case 'checking':
      return <p className="muted small">Checking this phone…</p>
    case 'off':
      return (
        <div className="echo-setup">
          {setup.outdated && <p className="notice">A new model was deployed or the phone cleared it. Download it again to keep using Echo.</p>}
          <button type="button" className="primary-action" onClick={onTurnOn}>
            {setup.bytes > 0 ? `Turn on Echo (${mb(setup.bytes)})` : 'Turn on Echo (already downloaded)'}
          </button>
          <p className="muted small">Downloads once from our server and then works offline.</p>
        </div>
      )
    case 'downloading': {
      const pct = setup.total ? Math.floor((100 * setup.loaded) / setup.total) : 0
      return (
        <div className="echo-setup">
          <div className="session-progress" aria-label="Download progress">
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="muted small">
            Downloading… {mb(setup.loaded)} of {mb(setup.total)} ({pct}%)
          </p>
        </div>
      )
    }
    case 'needs-mic':
      return (
        <div className="echo-setup">
          {setup.refused && <p className="notice">The microphone is blocked. Allow it for this site in Safari's settings, then tap Allow again.</p>}
          <button type="button" className="primary-action" disabled={setup.asking} onClick={onAllowMic}>
            {setup.asking ? 'Waiting for your answer…' : 'Allow the microphone'}
          </button>
          <p className="muted small">Last step. The mic is only on while you hold the button.</p>
        </div>
      )
    case 'error':
      return (
        <div className="echo-setup">
          <p className="notice">{setup.message}</p>
          <button type="button" className="primary-action" onClick={onTurnOn}>
            Try again
          </button>
        </div>
      )
    case 'on':
      return (
        <div className="echo-setup">
          <p className="small">{status}</p>
          <div className="lab-buttons">
            {actions}
            <button type="button" className="danger" onClick={onTurnOff}>
              Turn off
            </button>
          </div>
        </div>
      )
  }
}
