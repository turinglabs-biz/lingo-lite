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
      {showEnglish && (
        <div className="english">
          {expression.heard && (
            <span className="heard-mark" title="You'll hear this, not say it" aria-label="Heard">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10a5 5 0 0 1 10 0c0 3-3 3.5-3 6.5a2.5 2.5 0 0 1-5 0M10 10a2 2 0 0 1 4 0" />
              </svg>
            </span>
          )}
          {expression.english}
        </div>
      )}
      {showEnglish && expression.usageNote && <div className="note">{expression.usageNote}</div>}
    </div>
  )
}
