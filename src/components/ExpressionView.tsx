import type { Expression } from '../catalog/index.ts'
import { useSettings } from '../settings.ts'

/** An Expression as the learner sees it: Romanization prominent, Hangul subtle (or swapped in Settings). */
export function ExpressionView({
  expression,
  showEnglish = true,
  size = 'large',
}: {
  expression: Expression
  showEnglish?: boolean
  size?: 'large' | 'medium' | 'compact'
}) {
  const { hangulFirst } = useSettings()
  const primary = hangulFirst ? expression.hangul : expression.romanization
  const secondary = hangulFirst ? expression.romanization : expression.hangul
  return (
    <div className={`expression ${size}`}>
      <div className="primary" lang={hangulFirst ? 'ko' : undefined}>
        {primary}
      </div>
      <div className="secondary" lang={hangulFirst ? undefined : 'ko'}>
        {secondary}
      </div>
      {showEnglish && <div className="english">{expression.english}</div>}
      {showEnglish && expression.usageNote && <div className="note">{expression.usageNote}</div>}
    </div>
  )
}
