import { useState } from 'react'
import styles from './PhotoTips.module.css'

const DOS = [
  'Face clearly visible and centered',
  'Good natural lighting (near a window)',
  'Plain or light-colored background',
  'No heavy filters or color corrections',
  'Front-facing, looking at camera',
  'Hair pulled back if possible (to show neck/skin)',
]

const DONTS = [
  'Sunglasses or heavy makeup',
  'Dark or busy background',
  'Backlit photos (light behind you)',
  'Heavily filtered or edited selfies',
  'Side profile or angled shots',
  'Low resolution or blurry images',
]

export default function PhotoTips() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        💡 Tips for best results
        <span className={[styles.arrow, open ? styles.arrowOpen : ''].join(' ')}>▾</span>
      </button>

      <div className={[styles.card, open ? styles.cardOpen : ''].join(' ')} aria-hidden={!open}>
        <p className={styles.cardTitle}>📸 Photo Tips for Best Results</p>

        {/* Example thumbnails */}
        <div className={styles.examples}>
          <div className={styles.exampleWrap}>
            <div className={styles.thumb}>
              <img src="/images/tips/good-photo.png" className={styles.tipImg} alt="Good photo example" />
            </div>
            <span className={[styles.exLabel, styles.exLabelGood].join(' ')}>✓ Good</span>
            <span className={styles.exCaption}>Natural light, clear face</span>
          </div>
          <div className={styles.exampleWrap}>
            <div className={styles.thumb}>
              <img src="/images/tips/avoid-photo.png" className={styles.tipImg} alt="Avoid photo example" />
            </div>
            <span className={[styles.exLabel, styles.exLabelBad].join(' ')}>✗ Avoid</span>
            <span className={styles.exCaption}>Dark, backlit or filtered</span>
          </div>
        </div>

        {/* DO / DON'T grid */}
        <div className={styles.grid}>
          <div className={styles.col}>
            <span className={[styles.badge, styles.badgeGood].join(' ')}>✓ DO</span>
            <ul className={styles.tipList}>
              {DOS.map((tip) => (
                <li key={tip} className={styles.tipItem}>
                  <span className={styles.iconGood}>✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <span className={[styles.badge, styles.badgeBad].join(' ')}>✗ DON&apos;T</span>
            <ul className={styles.tipList}>
              {DONTS.map((tip) => (
                <li key={tip} className={styles.tipItem}>
                  <span className={styles.iconBad}>✗</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
