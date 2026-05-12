import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import styles from './HomePage.module.css'

const FEATURES = [
  {
    icon: '✦',
    tag: 'AI Analyzer',
    title: 'Photo Color Analysis',
    desc: 'Upload a selfie and our AI reads your skin undertone to reveal your personal color season instantly.',
    link: '/analyzer',
    cta: 'Analyze My Photo →',
  },
  {
    icon: '🎨',
    tag: 'Color Quiz',
    title: 'Guided Season Quiz',
    desc: '5 quick questions about your natural features — veins, skin tone, hair — to pinpoint your season.',
    link: '/tryon',
    cta: 'Take the Quiz →',
  },
  {
    icon: '💄',
    tag: 'Beauty Guide',
    title: 'Expert Beauty Tips',
    desc: 'Step-by-step tutorials and pro tips curated for each color season and skin tone.',
    link: '/looks',
    cta: 'View Guide →',
  },
]

const SEASONS = [
  {
    name: 'Spring',  tone: 'Warm & Bright', labelColor: '#C4724A',
    gradient: 'linear-gradient(135deg, #FFE8D6, #FFD6B0)',
    colors: ['#F7C59F','#F4A261','#E76F51','#A8DADC','#95C4C1'],
  },
  {
    name: 'Summer',  tone: 'Cool & Soft',   labelColor: '#6B8CAE',
    gradient: 'linear-gradient(135deg, #E8EFF7, #D4E4F4)',
    colors: ['#B8D4E8','#C9B8D8','#E8C4D0','#A8C4D8','#D4C4E4'],
  },
  {
    name: 'Autumn',  tone: 'Warm & Deep',   labelColor: '#8B5E3C',
    gradient: 'linear-gradient(135deg, #F5E6D0, #EDD5A8)',
    colors: ['#C4874A','#8B6340','#C4A951','#7A8B40','#A0522D'],
  },
  {
    name: 'Winter',  tone: 'Cool & Bold',   labelColor: '#3A5068',
    gradient: 'linear-gradient(135deg, #E8EEF4, #D0DCE8)',
    colors: ['#4A6FA5','#8B1A2E','#2E6B5A','#5A3A7A','#C8D4E0'],
  },
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

          {/* Card 1 — Spring swatches, top-left, -6deg */}
          <div className={[styles.moodCard, styles.moodCard1].join(' ')}>
            <span className={styles.moodCardSeason}>Spring</span>
            <div className={styles.moodCardDots}>
              {['#F7C59F','#F4A261','#E76F51','#A8DADC','#95C4C1'].map((c) => (
                <span key={c} className={styles.moodDot} style={{ background: c }} />
              ))}
            </div>
            <span className={styles.moodCardTag}>Warm &amp; Bright</span>
          </div>

          {/* Card 2 — Color wheel, center, slight tilt */}
          <div className={[styles.moodCard, styles.moodCard2].join(' ')}>
            <div className={styles.colorWheel} />
            <span className={styles.moodCard2Label}>Color Seasons</span>
          </div>

          {/* Card 3 — CTA, bottom-right, +4deg */}
          <div className={[styles.moodCard, styles.moodCard3].join(' ')}>
            <span className={styles.moodCard3Eye}>✦ Discover</span>
            <span className={styles.moodCard3Title}>Find Your Season</span>
          </div>
        </div>
      </section>

      {/* ══ Feature Cards ══ */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.tag} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                </div>
                <span className={styles.featureTag}>{f.tag}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                <Link to={f.link} className={styles.featureLink}>{f.cta}</Link>
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
              <span className={styles.eyebrow}>The Science of Color</span>
              <h2 className={styles.seasonHeading}>{t('section_what')}</h2>
              <p className={styles.seasonBody}>{t('section_what_body1')}</p>
              <p className={styles.seasonBody}>{t('section_what_body2')}</p>
              <Link to="/tryon" className={styles.seasonCta}>
                {t('section_what_cta')}
              </Link>
            </div>

            <div className={styles.seasonCards}>
              {SEASONS.map((s) => (
                <div key={s.name} className={styles.seasonCard}>
                  <div className={styles.seasonCardTop} style={{ background: s.gradient }}>
                    <span className={styles.seasonCardName} style={{ color: s.labelColor }}>{s.name}</span>
                  </div>
                  <div className={styles.seasonCardBottom}>
                    <span className={styles.seasonCardTone}>{s.tone}</span>
                    <div className={styles.seasonDots}>
                      {s.colors.map((c) => (
                        <span key={c} className={styles.seasonDot} style={{ background: c }} />
                      ))}
                    </div>
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
