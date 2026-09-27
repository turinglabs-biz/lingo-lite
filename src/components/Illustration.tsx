import { illustrationSvg } from '../../catalog/illustrations.ts'

/** An Expression's Illustration, inline so it follows the theme's colors. */
export function Illustration({ expressionId, size = 'medium' }: { expressionId: string; size?: 'small' | 'medium' | 'large' }) {
  const svg = illustrationSvg(expressionId)
  if (!svg) return null
  return <span className={`illustration ${size}`} dangerouslySetInnerHTML={{ __html: svg }} />
}
