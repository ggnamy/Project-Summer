import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import styles from './HomePage.module.css'

const FEATURES = [
  { icon: '✦', titleKey: 'home_feat1_title', descKey: 'home_feat1_desc', link: '/analyzer', ctaKey: 'btn_analyze',    tagKey: 'nav_analyzer' },
  { icon: '🎨', titleKey: 'home_feat2_title', descKey: 'home_feat2_desc', link: '/tryon',    ctaKey: 'btn_quiz',       tagKey: 'nav_quiz'     },
  { icon: '💬', titleKey: 'home_feat3_title', descKey: 'home_feat3_desc', link: '/tips',     ctaKey: 'home_feat3_cta', tagKey: 'nav_tips'     },
]

const SEASONS = [
  { nameKey: 'season_spring', toneKey: 'warm_bright', img: '/images/seasons/spring-home.png' },
  { nameKey: 'season_summer', toneKey: 'cool_soft',   img: '/images/seasons/summer-home.png' },
  { nameKey: 'season_autumn', toneKey: 'warm_deep',   img: '/images/seasons/autumn-home.png' },
  { nameKey: 'season_winter', toneKey: 'cool_bold',   img: '/images/seasons/winter-home.png' },
]

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <main className={styles.main}>

      {/* ── Decorative blobs ── */}
      <div className={styles.blobA} aria-hidden="true" />
      <div className={styles.blobB} aria-hidden="true" />

      {/* ══ Hero ══ */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.pill}>{t('hero_badge')}</span>

          <h1 className={styles.headline}>
            {t('hero_title1')}<br />
            <span className={styles.gradientText}>{t('hero_title2')}</span>
          </h1>

          <p className={styles.subline}>{t('hero_sub')}</p>

          <div className={styles.heroBtns}>
            <Link to="/analyzer" className={styles.btnPrimary}>
              {t('btn_analyze')}
            </Link>
            <Link to="/tryon" className={styles.btnOutline}>
              {t('btn_quiz')}
            </Link>
          </div>
        </div>

        {/* Mood-board collage */}
        <div className={styles.heroDecor} aria-hidden="true">
          <span className={styles.sparkle} style={{ top: '6%',   left: '14%' }}>✦</span>
          <span className={styles.sparkle} style={{ top: '22%',  right: '4%',  animationDelay: '0.9s' }}>✦</span>
          <span className={styles.sparkle} style={{ bottom: '20%', left: '2%', animationDelay: '1.5s' }}>✦</span>
          <span className={styles.sparkle} style={{ bottom: '8%', right: '16%', animationDelay: '0.4s' }}>✦</span>

          {/* Card 1 — Lip & Blush shades */}
          <div className={[styles.moodCard, styles.moodCard1].join(' ')}>
            <span className={styles.moodCardSeason}>{t('home_mood_card1_name')}</span>
            <div className={styles.moodCardDots}>
              {['#C0392B','#E74C7B','#F4A261','#D4877A','#F9C6C6'].map((c) => (
                <span key={c} className={styles.moodDot} style={{ background: c }} />
              ))}
            </div>
            <span className={styles.moodCardTag}>{t('home_mood_card1_tag')}</span>
          </div>

          {/* Card 2 — Color wheel */}
          <div className={[styles.moodCard, styles.moodCard2].join(' ')}>
            <div className={styles.colorWheel} />
            <span className={styles.moodCard2Label}>{t('home_mood_card2_label')}</span>
          </div>

          {/* Card 3 — Beauty tips CTA */}
          <div className={[styles.moodCard, styles.moodCard3].join(' ')}>
            <span className={styles.moodCard3Eye}>{t('home_mood_card3_eye')}</span>
            <span className={styles.moodCard3Title}>{t('home_mood_card3_title')}</span>
          </div>
        </div>
      </section>

      {/* ══ Feature Cards ══ */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.titleKey} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                </div>
                <span className={styles.featureTag}>{t(f.tagKey)}</span>
                <h3 className={styles.featureTitle}>{t(f.titleKey)}</h3>
                <p className={styles.featureDesc}>{t(f.descKey)}</p>
                <Link to={f.link} className={styles.featureLink}>{t(f.ctaKey)}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ What is Personal Color? ══ */}
      <section className={styles.seasonSection}>
        <div className="container">
          <div className={styles.seasonLayout}>

            <div className={styles.seasonText}>
              <span className={styles.eyebrow}>{t('home_science_badge')}</span>
              <h2 className={styles.seasonHeading}>{t('section_what')}</h2>
              <p className={styles.seasonBody}>{t('section_what_body1')}</p>
              <p className={styles.seasonBody}>{t('section_what_body2')}</p>
              <Link to="/tryon" className={styles.seasonCta}>
                {t('section_what_cta')}
              </Link>
            </div>

            <div className={styles.seasonCards}>
              {SEASONS.map((s) => (
                <div key={s.nameKey} className={styles.seasonCard}>
                  <img src={s.img} alt={t(s.nameKey)} className={styles.seasonCardImg} />
                  <div className={styles.seasonCardOverlay}>
                    <span className={styles.seasonCardName}>{t(s.nameKey)}</span>
                    <span className={styles.seasonCardTone}>{t(s.toneKey)}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══ CTA Banner ══ */}
      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerInner}>
            <p className={styles.bannerEyebrow}>{t('banner_eyebrow')}</p>
            <h2 className={styles.bannerTitle}>{t('banner_title')}</h2>
            <p className={styles.bannerSub}>{t('banner_sub')}</p>
            <Link to="/analyzer" className={styles.btnBanner}>{t('banner_cta')}</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
