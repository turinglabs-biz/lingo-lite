import { db } from '../db.ts'
import { updateSettings } from '../settings.ts'
import { EchoSetup } from './EchoSetup.tsx'
import { lab } from './lab/results.ts'
import { ECHO_MODEL } from './models.ts'
import { useEchoSetup } from './useEchoSetup.ts'

/** The Settings row that turns Echo on in the main flow. The Echo lab has its own switch but shares the files. */
export function EchoSettings() {
  const { setup, turnOn, allowMic, turnOff } = useEchoSetup(ECHO_MODEL, {
    isOn: async () => !!(await db.settings.get('settings'))?.echo,
    setOn: (echo) => updateSettings({ echo }),
    othersNeedFiles: () => lab.on().includes(ECHO_MODEL.id),
  })
  return (
    <li className="row echo-settings">
      <span>
        Echo
        <span className="muted small block">Hold the mic after hearing an Expression, say it back, and see how close you were.</span>
      </span>
      <EchoSetup
        setup={setup}
        onTurnOn={turnOn}
        onAllowMic={allowMic}
        onTurnOff={turnOff}
        status="Echo is on: look for the mic after each answer, at new Expressions and in the Phrasebook."
      />
    </li>
  )
}
