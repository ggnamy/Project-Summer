import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const steps = [
  {
    icon: '📷',
    title: 'Upload Your Photo',
    desc: 'Take or upload a clear, well-lit selfie. Natural light works best.',
  },
  {
    icon: '🤖',
    title: 'AI Color Analysis',
    desc: 'Claude AI analyses your skin undertone and assigns your personal color season.',
  },
  {
    icon: '🎨',
    title: 'Virtual Try-On',
    desc: 'Preview lip, blush, hair, and eyeshadow colors matched to your season.',
  },
  {
    icon: '💾',
    title: 'Save Your Looks',
    desc: 'Bookmark favourite combinations and revisit them any time.',
  },
]

const seasons = [
  { label: 'Spring', emoji: '🌸', tagline: 'Warm · Light · Bright', bg: '#FFF5F2' },
  { label: 'Summer', emoji: '🌿', tagline: 'Cool · Light · Muted',  bg: '#F0F4F8' },
  { label: 'Autumn', emoji: '🍂', tagline: 'Warm · Deep · Muted',   bg: '#FDF4EC' },
  { label: 'Winter', emoji: '❄️', tagline: 'Cool · Deep · Clear',   bg: '#F0F0F8' },
]

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBlob} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.pill}>AI-Powered Personal Styling</span>
          <h1 className={styles.headline}>
            Discover Your<br />
            <span className={styles.gradient}>True Color Season</span>
          </h1>
          <p className={styles.subline}>
            Upload a photo and let Claude AI reveal your personal color palette —
            then try on curated shades in real time.
          </p>
          <div className={styles.ctas}>
            <Link to="/analyzer" className={styles.btnPrimary}>
              Analyze My Colors
            </Link>
            <Link to="/tryon" className={styles.btnSecondary}>
              Virtual Try-On →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSub}>Four simple steps to your perfect palette</p>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Season cards */}
      <section className={styles.section} style={{ background: 'var(--bg-subtle)' }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>The Four Seasons</h2>
          <p className={styles.sectionSub}>Every complexion belongs to one of four colour families</p>
          <div className={styles.seasonGrid}>
            {seasons.map((s) => (
              <div key={s.label} className={styles.seasonCard} style={{ background: s.bg }}>
                <span className={styles.seasonEmoji}>{s.emoji}</span>
                <h3 className={styles.seasonLabel}>{s.label}</h3>
                <p className={styles.seasonTagline}>{s.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className={styles.banner}>
        <div className="container">
          <h2 className={styles.bannerTitle}>Ready to find your aura?</h2>
          <Link to="/analyzer" className={styles.btnPrimary}>
            Get Started &mdash; It&apos;s Free
          </Link>
        </div>
      </section>
    </main>
  )
}
