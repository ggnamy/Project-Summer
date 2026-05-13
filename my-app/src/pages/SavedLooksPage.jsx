import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import styles from './SavedLooksPage.module.css'

const SEASONS_DATA = [
  {
    id: 'spring',
    toneKey: 'result_warm_tone',
    emoji: '🌸',
    nameKey: 'season_spring',
    headerGradient: 'linear-gradient(135deg, #FFE8D6, #FECBA1)',
    nameColor: '#C4724A',
    swatches: ['#F7C59F','#F4A261','#E76F51','#A8DADC','#95C4C1'],
    steps: [1, 2, 3, 4, 5, 6].map((n) => ({ n, duration: [3, 5, 2, 8, 2, 2][n - 1] })),
  },
  {
    id: 'summer',
    toneKey: 'result_cool_tone',
    emoji: '☁️',
    nameKey: 'season_summer',
    headerGradient: 'linear-gradient(135deg, #E8EFF7, #C9D8F0)',
    nameColor: '#5A7A9E',
    swatches: ['#B8D4E8','#C9B8D8','#E8C4D0','#A8C4D8','#D4C4E4'],
    steps: [1, 2, 3, 4, 5, 6].map((n) => ({ n, duration: [3, 5, 2, 8, 2, 2][n - 1] })),
  },
  {
    id: 'autumn',
    toneKey: 'result_warm_tone',
    emoji: '🍂',
    nameKey: 'season_autumn',
    headerGradient: 'linear-gradient(135deg, #F5E6D0, #E8C88A)',
    nameColor: '#8B5E2C',
    swatches: ['#C4874A','#8B6340','#C4A951','#7A8B40','#A0522D'],
    steps: [1, 2, 3, 4, 5, 6].map((n) => ({ n, duration: [3, 5, 2, 8, 2, 2][n - 1] })),
  },
  {
    id: 'winter',
    toneKey: 'result_cool_tone',
    emoji: '❄️',
    nameKey: 'season_winter',
    headerGradient: 'linear-gradient(135deg, #E0E8F4, #C0D0E8)',
    nameColor: '#3A5A80',
    swatches: ['#4A6FA5','#8B1A2E','#2E6B5A','#5A3A7A','#C8D4E0'],
    steps: [1, 2, 3, 4, 5, 6].map((n) => ({ n, duration: [3, 5, 2, 8, 2, 2][n - 1] })),
  },
]

const DECOR_CIRCLES = [
  { color: '#F4A261', size: 80, labelKey: 'season_spring', top: 10,  left: 10  },
  { color: '#B8C5D6', size: 60, labelKey: 'season_summer', top: 25,  left: 120 },
  { color: '#C4873A', size: 70, labelKey: 'season_autumn', top: 110, left: 55  },
  { color: '#4A6FA5', size: 50, labelKey: 'season_winter', top: 155, left: 155 },
]

function SeasonCard({ season }) {
  const [openStep, setOpenStep] = useState(null)
  const { t } = useTranslation()

  const toggle = (n) => setOpenStep((prev) => (prev === n ? null : n))

  return (
    <div className={styles.seasonCard}>

      {/* Card Header */}
      <div className={styles.cardHeader} style={{ background: season.headerGradient }}>
        <div className={styles.cardHeaderTop}>
          <span className={styles.toneBadge}>{t(season.toneKey)}</span>
        </div>
        <div className={styles.cardHeaderBottom}>
          <h2 className={styles.cardSeasonName} style={{ color: season.nameColor }}>
            {season.emoji} {t(season.nameKey)}
          </h2>
          <div className={styles.swatchRow}>
            {season.swatches.map((c) => (
              <span key={c} className={styles.swatch} style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <span className={styles.tutorialLabel}>{t('guide_tutorial_label')}</span>

        <div className={styles.accordionList}>
          {season.steps.map((step) => {
            const stepNameKey = `guide_step${step.n}_name`
            const stepDescKey = `${season.id}_step${step.n}_desc`
            const stepTipKey  = `${season.id}_step${step.n}_tip`
            const tipText     = t(stepTipKey)
            return (
              <div key={step.n} className={styles.accordionItem}>
                <button
                  type="button"
                  className={styles.accordionTrigger}
                  onClick={() => toggle(step.n)}
                >
                  <div className={styles.accordionLeft}>
                    <span className={styles.stepNum}>{step.n}</span>
                    <span className={styles.stepName}>{t(stepNameKey)}</span>
                    <span className={styles.stepTime}>{step.duration} {t('min_label')}</span>
                  </div>
                  <span className={[styles.accordionArrow, openStep === step.n ? styles.accordionArrowOpen : ''].join(' ')}>
                    ▾
                  </span>
                </button>

                <div className={[styles.accordionContent, openStep === step.n ? styles.accordionContentOpen : ''].join(' ')}>
                  <p className={styles.stepDesc}>{t(stepDescKey)}</p>
                  {tipText && (
                    <div className={styles.stepTipBox}>
                      <span className={styles.stepTipLabel}>{t('guide_tip_label')}</span>
                      <span>{tipText}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SavedLooksPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { t } = useTranslation()

  const TABS = [
    { id: 'all' },
    { id: 'spring', emoji: '🌸', nameKey: 'season_spring' },
    { id: 'summer', emoji: '☁️', nameKey: 'season_summer' },
    { id: 'autumn', emoji: '🍂', nameKey: 'season_autumn' },
    { id: 'winter', emoji: '❄️', nameKey: 'season_winter' },
  ]

  const visibleSeasons = activeFilter === 'all'
    ? SEASONS_DATA
    : SEASONS_DATA.filter((s) => s.id === activeFilter)

  return (
    <main className={styles.main}>

      {/* ══ Hero ══ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroBadge}>{t('guide_badge')}</span>
            <h1 className={styles.heroTitle}>{t('guide_title')}</h1>
            <p className={styles.heroSub}>{t('guide_subtitle')}</p>
            <Link to="/tryon" className={styles.heroCta}>{t('guide_cta')}</Link>
          </div>

          <div className={styles.heroRight} aria-hidden="true">
            {DECOR_CIRCLES.map(({ color, size, labelKey, top, left }) => (
              <span
                key={labelKey}
                className={styles.decorCircle}
                style={{ background: color, width: size, height: size, top, left }}
              />
            ))}
          </div>
        </div>
        <div className={styles.heroLine} aria-hidden="true" />
      </section>

      {/* ══ Filter Tabs ══ */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={[styles.tab, activeFilter === tab.id ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.id === 'all'
                ? t('guide_filter_all')
                : `${tab.emoji} ${t(tab.nameKey)}`}
            </button>
          ))}
        </div>
      </div>

      {/* ══ Season Cards ══ */}
      <div className={styles.container}>
        <div className={styles.cardsGrid}>
          {visibleSeasons.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>

        {/* ══ Universal Tips Banner ══ */}
        <section className={styles.tipsBanner}>
          <h2 className={styles.tipsTitle}>{t('guide_universal_title')}</h2>
          <div className={styles.tipsRow}>
            {[
              { icon: '💧', titleKey: 'guide_tip1_title', descKey: 'guide_tip1_desc' },
              { icon: '🎨', titleKey: 'guide_tip2_title', descKey: 'guide_tip2_desc' },
              { icon: '✨', titleKey: 'guide_tip3_title', descKey: 'guide_tip3_desc' },
            ].map((tip) => (
              <div key={tip.titleKey} className={styles.tipCard}>
                <span className={styles.tipIcon}>{tip.icon}</span>
                <h3 className={styles.tipTitle}>{t(tip.titleKey)}</h3>
                <p className={styles.tipBody}>{t(tip.descKey)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  )
}
