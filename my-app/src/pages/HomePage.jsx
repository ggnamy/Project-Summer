import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const steps = [
  {
    icon: '📷',
    title: 'Upload Your Photo',
    desc: 'Take or upload a clear, well-lit selfie. Natural light works best for accurate results.',
  },
  {
    icon: '✦',
    title: 'AI Color Analysis',
    desc: 'Our AI analyses your photo and assigns your personal color season.',
  },
  {
    icon: '💄',
    title: 'Virtual Try-On',
    desc: 'Preview lip, blush, hair, and eyeshadow colors perfectly matched to your season.',
  },
  {
    icon: '📖',
    title: 'Beauty Guide',
    desc: 'Follow step-by-step tutorials and pro tips tailored to your unique color palette.',
  },
]


export default function HomePage() {
  return (
    <main className={styles.main}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBlob} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.pill}>AI-Powered Personal Styling</span>
          <h1 className={styles.headline}>
            Discover Your<br />
            <span className={styles.gradient}>True Color Season</span>
          </h1>
          <p className={styles.subline}>
            Upload a photo and let AI reveal your personal color palette —
            matched to your unique color season.
          </p>
          <Link to="/analyzer" className={styles.btnPrimary}>
            Analyze My Colors
          </Link>
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
          <h2 className={styles.bannerTitle}>Ready to find your aura?</h2>
          <p className={styles.bannerSub}>Upload a photo and get your color season in seconds.</p>
          <Link to="/analyzer" className={styles.btnBanner}>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

    </main>
  )
}
