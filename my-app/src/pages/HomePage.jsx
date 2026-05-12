import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const steps = [
  {
    icon: '📷',
    title: 'Upload Your Photo',
    desc: 'Take or upload a clear, well-lit selfie. Natural light works best for the most accurate color reading.',
  },
  {
    icon: '✦',
    title: 'AI Color Analysis',
    desc: 'Our AI scans your skin tone and undertone to determine your personal color season instantly.',
  },
  {
    icon: '🎨',
    title: 'Personal Color Quiz',
    desc: 'Answer 5 quick questions about your natural features to confirm and refine your color season.',
  },
  {
    icon: '📖',
    title: 'Beauty Guide',
    desc: 'Explore curated palettes, outfit tips, and makeup looks tailored to your unique color season.',
  },
]

const features = [
  {
    tag: 'AI Analyzer',
    icon: '✦',
    title: 'Find Your Color Season',
    desc: 'Upload a selfie and let our AI analyze your undertone and skin tone to reveal whether you are a Spring, Summer, Autumn, or Winter.',
    link: '/analyzer',
    linkLabel: 'Try the Analyzer →',
    accent: 'var(--primary)',
    bg: 'var(--primary-light)',
  },
  {
    tag: 'Color Quiz',
    icon: '🌸',
    title: 'Discover via Quiz',
    desc: 'Prefer a guided approach? Answer 5 simple questions about your veins, skin tone, and hair to uncover your personal color season.',
    link: '/tryon',
    linkLabel: 'Take the Quiz →',
    accent: '#8B9EB0',
    bg: 'rgba(139,158,176,0.1)',
  },
]

export default function HomePage() {
  return (
    <main className={styles.main}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBlob} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.pill}>Personal Color Discovery</span>
          <h1 className={styles.headline}>
            Discover Your<br />
            <span className={styles.gradient}>True Color Season</span>
          </h1>
          <p className={styles.subline}>
            Upload a photo or take a quick quiz — find out if you're a Spring, Summer, Autumn, or Winter and unlock your perfect palette.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/analyzer" className={styles.btnPrimary}>
              Analyze My Colors
            </Link>
            <Link to="/tryon" className={styles.btnSecondary}>
              Take the Quiz
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className={styles.featureSection}>
        <div className="container">
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.tag} className={styles.featureCard} style={{ '--accent': f.accent, '--feat-bg': f.bg }}>
                <div className={styles.featureTag}>{f.tag}</div>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                <Link to={f.link} className={styles.featureLink}>{f.linkLabel}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
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

      {/* ── CTA Banner ── */}
      <section className={styles.banner}>
        <div className="container">
          <p className={styles.bannerEyebrow}>Free · Instant · AI-Powered</p>
          <h2 className={styles.bannerTitle}>Ready to find your color season?</h2>
          <p className={styles.bannerSub}>Upload a photo and get your personal color analysis in seconds.</p>
          <Link to="/analyzer" className={styles.btnBanner}>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

    </main>
  )
}
