import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styles from './SavedLooksPage.module.css'

const TUTORIAL_STEPS = [
  {
    step: 1,
    icon: '💧',
    title: 'Skincare & Prep',
    description: 'Start with a clean, moisturized face. Apply a lightweight primer suited to your skin type — hydrating for dry skin, mattifying for oily.',
    tip: 'Wait 2–3 minutes for primer to set before applying foundation. This makes your base last much longer.',
    duration: '3–5 min',
  },
  {
    step: 2,
    icon: '✨',
    title: 'Foundation & Concealer',
    description: 'Apply foundation with a damp sponge or brush, starting from the center of your face and blending outward. Dab concealer under eyes and on any blemishes.',
    tip: 'Use concealer one shade lighter than your foundation for under-eyes. Blend with a tapping motion, not dragging.',
    duration: '5–7 min',
  },
  {
    step: 3,
    icon: '🔆',
    title: 'Contour & Blush',
    description: 'Lightly contour the hollows of your cheeks, nose sides, and jawline. Then smile and apply blush to the apples of your cheeks, blending upward toward the temples.',
    tip: 'Choose blush that matches your natural flush color — it will always look the most natural and flattering.',
    duration: '3–5 min',
  },
  {
    step: 4,
    icon: '👁️',
    title: 'Eye Makeup',
    description: 'Apply a neutral base shadow all over the lid. Add a deeper shade to the crease and blend well. Line close to the lash line and finish with mascara.',
    tip: 'Always blend in circular motions at the crease — harsh lines make eyes look smaller. Build color gradually.',
    duration: '7–10 min',
  },
  {
    step: 5,
    icon: '🪮',
    title: 'Brows',
    description: 'Fill in sparse areas with short, hair-like strokes using a brow pencil or powder. Follow your natural brow shape and set with a clear brow gel.',
    tip: 'The tail of your brow should align with the outer corner of your eye. A clean brow instantly lifts the whole face.',
    duration: '2–3 min',
  },
  {
    step: 6,
    icon: '💋',
    title: 'Lip Color',
    description: 'Line lips with a matching pencil to define the shape and prevent feathering. Apply your chosen lip color from the center outward for a clean, even finish.',
    tip: 'Blot with a tissue and apply a second layer for longer-lasting color. For fullness, add a touch of gloss to the center.',
    duration: '2–3 min',
  },
  {
    step: 7,
    icon: '🌟',
    title: 'Set & Finish',
    description: 'Dust a light setting powder over the T-zone to control shine. Spritz a setting spray all over your face to lock everything in place and give a natural finish.',
    tip: 'Hold the setting spray 30 cm from your face and mist in a figure-8 pattern for even, seamless coverage.',
    duration: '2 min',
  },
]

const PRO_TIPS = [
  {
    icon: '☀️',
    title: 'Check in Natural Light',
    body: 'Always do a final check in daylight before you head out. Artificial light can make colors appear warmer or cooler than they truly are on your skin.',
  },
  {
    icon: '🎨',
    title: 'Match Your Undertone First',
    body: 'Look at the veins on your inner wrist. Blue-purple veins mean cool undertones; green veins mean warm. This is the single most important step before choosing any color.',
  },
  {
    icon: '💧',
    title: 'Prep Your Skin Well',
    body: 'Moisturize and prime before applying makeup. Hydrated skin makes colors appear more vibrant, helps foundation last longer, and gives a smoother finish.',
  },
  {
    icon: '✦',
    title: 'Build, Don\'t Pile',
    body: 'Start with a light hand and layer gradually. Thin layers blend seamlessly and look natural — heavy applications can look cakey and emphasize texture.',
  },
]

export default function SavedLooksPage() {
  const { season } = useSelector((s) => s.analysis)

  return (
    <main className={styles.main}>
      <div className="container">

        {/* ── Page header ── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Beauty Guide</h1>
          <p className={styles.subtitle}>
            Learn how to build a flawless look from scratch — step by step, with tips tailored to your color season.
          </p>
          {!season && (
            <Link to="/analyzer" className={styles.ctaBtnInline}>
              Find My Season First →
            </Link>
          )}
          {season && (
            <div className={styles.detectedSeason}>
              Your season: <strong>{season}</strong> — use your palette colors in each step below.
            </div>
          )}
        </div>

        {/* ── Tutorial steps ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Step-by-Step Full Face Tutorial</h2>
          <p className={styles.sectionSub}>Total time: approximately 25–35 minutes</p>
          <div className={styles.stepsGrid}>
            {TUTORIAL_STEPS.map((s) => (
              <div key={s.step} className={styles.stepCard}>
                <div className={styles.stepLeft}>
                  <div className={styles.stepNumber}>{s.step}</div>
                  <div className={styles.stepLine} />
                </div>
                <div className={styles.stepRight}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepIcon}>{s.icon}</span>
                    <div>
                      <h3 className={styles.stepTitle}>{s.title}</h3>
                      <span className={styles.stepDuration}>{s.duration}</span>
                    </div>
                  </div>
                  <p className={styles.stepDesc}>{s.description}</p>
                  <div className={styles.stepTip}>
                    <span className={styles.stepTipLabel}>Tip</span>
                    <p>{s.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pro tips ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pro Application Tips</h2>
          <div className={styles.proGrid}>
            {PRO_TIPS.map((tip) => (
              <div key={tip.title} className={styles.proCard}>
                <span className={styles.proIcon}>{tip.icon}</span>
                <h3 className={styles.proTitle}>{tip.title}</h3>
                <p className={styles.proBody}>{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className={styles.ctaBox}>
          <p className={styles.ctaHeading}>Ready to try your colors?</p>
          <p className={styles.ctaText}>Upload your photo and see your personalized aura score.</p>
          <div className={styles.ctaBtns}>
            <Link to="/analyzer" className={styles.ctaBtnPrimary}>Analyze My Colors →</Link>
            <Link to="/tryon"    className={styles.ctaBtnSecondary}>Virtual Try-On</Link>
          </div>
        </div>

      </div>
    </main>
  )
}
