import { playClip } from '../audio/player.ts'

/** Normal and Slow playback for one Expression. */
export function PlayButtons({ expressionId, size = 'normal' }: { expressionId: string; size?: 'normal' | 'large' }) {
  return (
    <div className={`play-buttons ${size}`}>
      <button type="button" className="play" onClick={() => playClip(expressionId, 'normal')} aria-label="Play">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" className="play slow" onClick={() => playClip(expressionId, 'slow')} aria-label="Play slowly">
        0.75×
      </button>
    </div>
  )
}
