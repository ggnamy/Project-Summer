import styles from './AuraScoreMeter.module.css'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreColor(score) {
  if (score >= 80) return '#7EC8A0'
  if (score >= 60) return '#D4877A'
  if (score >= 40) return '#C4A882'
  return '#8B9EB0'
}

function scoreLabel(score) {
  if (score >= 90) return 'Radiant'
  if (score >= 75) return 'Luminous'
  if (score >= 60) return 'Glowing'
  if (score >= 45) return 'Balanced'
  if (score >= 30) return 'Emerging'
  return 'Discovering'
}

export default function AuraScoreMeter({ score = 0, animated = true }) {
  const pct     = Math.min(100, Math.max(0, score)) / 100
  const offset  = CIRCUMFERENCE * (1 - pct)
  const color   = scoreColor(score)

  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox="0 0 120 120" aria-label={`Aura score: ${score}`}>
        {/* track */}
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        {/* progress */}
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          className={animated ? styles.animated : ''}
          style={{ transition: animated ? 'stroke-dashoffset 1s ease, stroke 0.4s' : 'none' }}
        />
        {/* score text */}
        <text x="60" y="55" textAnchor="middle" className={styles.scoreText} fill={color}>
          {score}
        </text>
        <text x="60" y="70" textAnchor="middle" className={styles.label} fill="var(--text-muted)">
          / 100
        </text>
      </svg>

      <p className={styles.badge} style={{ color, borderColor: color + '40', background: color + '15' }}>
        {scoreLabel(score)}
      </p>
    </div>
  )
}
