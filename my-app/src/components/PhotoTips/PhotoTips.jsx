import { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './PhotoTips.module.css'

export default function PhotoTips() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const DOS   = ['do1','do2','do3','do4','do5','do6']
  const DONTS = ['dont1','dont2','dont3','dont4','dont5','dont6']

  return (
    <div className={styles.wrap}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {t('analyzer_tips_toggle')}
        <span className={[styles.arrow, open ? styles.arrowOpen : ''].join(' ')}>▾</span>
      </button>

      <div className={[styles.card, open ? styles.cardOpen : ''].join(' ')} aria-hidden={!open}>
        <p className={styles.cardTitle}>{t('analyzer_tips_title')}</p>

        {/* Example thumbnails */}
        <div className={styles.examples}>
          <div className={styles.exampleWrap}>
            <div className={styles.thumb}>
              <img src="/images/tips/good-photo.png" className={styles.tipImg} alt={t('analyzer_good_label')} />
            </div>
            <span className={[styles.exLabel, styles.exLabelGood].join(' ')}>{t('analyzer_good_label')}</span>
            <span className={styles.exCaption}>{t('analyzer_good_caption')}</span>
          </div>
          <div className={styles.exampleWrap}>
            <div className={styles.thumb}>
              <img src="/images/tips/avoid-photo.png" className={styles.tipImg} alt={t('analyzer_avoid_label')} />
            </div>
            <span className={[styles.exLabel, styles.exLabelBad].join(' ')}>{t('analyzer_avoid_label')}</span>
            <span className={styles.exCaption}>{t('analyzer_avoid_caption')}</span>
          </div>
        </div>

        {/* DO / DON'T grid */}
        <div className={styles.grid}>
          <div className={styles.col}>
            <span className={[styles.badge, styles.badgeGood].join(' ')}>{t('analyzer_do')}</span>
            <ul className={styles.tipList}>
              {DOS.map((key) => (
                <li key={key} className={styles.tipItem}>
                  <span className={styles.iconGood}>✓</span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <span className={[styles.badge, styles.badgeBad].join(' ')}>{t('analyzer_dont')}</span>
            <ul className={styles.tipList}>
              {DONTS.map((key) => (
                <li key={key} className={styles.tipItem}>
                  <span className={styles.iconBad}>✗</span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
