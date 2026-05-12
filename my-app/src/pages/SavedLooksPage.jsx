import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './SavedLooksPage.module.css'

const SEASONS_DATA = [
  {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    tone: 'WARM TONE',
    headerGradient: 'linear-gradient(135deg, #FFE8D6, #FECBA1)',
    nameColor: '#C4724A',
    swatches: ['#F7C59F','#F4A261','#E76F51','#A8DADC','#95C4C1'],
    steps: [
      {
        n: 1, name: 'Skin Prep', duration: '3 min',
        desc: 'Apply a lightweight hydrating primer. Spring types glow with dewy, fresh-looking skin — avoid matte finishes.',
        tip: 'Use a vitamin C serum underneath for extra radiance.',
      },
      {
        n: 2, name: 'Foundation & Concealer', duration: '5 min',
        desc: 'Choose a warm-toned foundation (golden or peachy undertone). Shade: 1–2 levels lighter than your deepest skin tone.',
        tip: 'Blend with a damp beauty sponge for a natural finish.',
      },
      {
        n: 3, name: 'Blush', duration: '2 min',
        desc: 'Best shades: coral, peach, warm pink. Apply to the apples of cheeks and blend upward toward temples.',
        tip: 'Spring types look best with a flushed, just-pinched look.',
      },
      {
        n: 4, name: 'Eye Makeup', duration: '8 min',
        desc: 'Warm browns, terracotta, champagne gold, soft olive. Avoid cool greys or dark charcoal.',
        tip: 'Tight-line with brown eyeliner instead of black.',
      },
      {
        n: 5, name: 'Lips', duration: '2 min',
        desc: 'Best colors: coral red, warm nude, peachy pink, tomato red. Avoid blue-based reds or cool mauves.',
        tip: 'Top with a clear gloss for that Spring freshness.',
      },
      {
        n: 6, name: 'Setting', duration: '2 min',
        desc: 'Dewy setting spray only — never heavy powder. Spring types need to maintain luminosity.',
        tip: '',
      },
    ],
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '☁️',
    tone: 'COOL TONE',
    headerGradient: 'linear-gradient(135deg, #E8EFF7, #C9D8F0)',
    nameColor: '#5A7A9E',
    swatches: ['#B8D4E8','#C9B8D8','#E8C4D0','#A8C4D8','#D4C4E4'],
    steps: [
      {
        n: 1, name: 'Skin Prep', duration: '3 min',
        desc: 'Lightweight moisturizer + blurring primer. Summer types suit a soft-focus, porcelain skin look.',
        tip: 'Apply a lavender color-correcting primer to neutralize any redness.',
      },
      {
        n: 2, name: 'Foundation', duration: '5 min',
        desc: 'Choose a cool or neutral-toned foundation with a pink or rosy undertone. Avoid orange or yellow-based formulas.',
        tip: 'Build coverage lightly — Summer types look best with skin showing through.',
      },
      {
        n: 3, name: 'Blush', duration: '2 min',
        desc: 'Dusty rose, soft mauve, cool pink, lavender blush. Apply softly on cheekbones — Summer suits a delicate flush.',
        tip: 'Try a cream blush for a natural, watercolor effect.',
      },
      {
        n: 4, name: 'Eye Makeup', duration: '8 min',
        desc: 'Soft taupe, lavender, dusty rose, slate blue, mauve. Avoid warm browns or gold — they look muddy on cool skin.',
        tip: 'Brown-black mascara instead of jet black looks softer and more natural.',
      },
      {
        n: 5, name: 'Lips', duration: '2 min',
        desc: 'Best: dusty rose, raspberry, cool nude, berry, soft fuchsia. Avoid orange-based or warm nudes — they wash you out.',
        tip: 'A tinted lip balm in rose gives a perfectly effortless Summer look.',
      },
      {
        n: 6, name: 'Setting', duration: '2 min',
        desc: 'Light pressed powder in a translucent pink-toned formula. Avoid yellow-based powders.',
        tip: '',
      },
    ],
  },
  {
    id: 'autumn',
    name: 'Autumn',
    emoji: '🍂',
    tone: 'WARM TONE',
    headerGradient: 'linear-gradient(135deg, #F5E6D0, #E8C88A)',
    nameColor: '#8B5E2C',
    swatches: ['#C4874A','#8B6340','#C4A951','#7A8B40','#A0522D'],
    steps: [
      {
        n: 1, name: 'Skin Prep', duration: '3 min',
        desc: 'Rich moisturizer + satin-finish primer. Autumn types suit a warm, healthy-looking skin texture.',
        tip: 'Add a drop of facial oil to foundation for depth and warmth.',
      },
      {
        n: 2, name: 'Foundation', duration: '5 min',
        desc: 'Deep golden, warm beige, or amber-toned foundation. Autumn types suit the richest warm shades beautifully.',
        tip: 'Use a flat brush to pack coverage — Autumn suits a more polished finish.',
      },
      {
        n: 3, name: 'Blush', duration: '2 min',
        desc: 'Terracotta, warm brick, deep peach, earthy coral. Apply more heavily than Spring — Autumn suits a sculpted flush.',
        tip: 'Dust bronzer first, then blush on top for dimension.',
      },
      {
        n: 4, name: 'Eye Makeup', duration: '8 min',
        desc: 'Burnt sienna, chocolate brown, olive green, deep gold, rust. Autumn eyes are meant to be smoky and rich.',
        tip: 'Smudge a deep brown along the lower lash line for a sultry look.',
      },
      {
        n: 5, name: 'Lips', duration: '2 min',
        desc: 'Best: burnt orange, deep terracotta, warm brown, brick red, caramel. Avoid cool pinks or blue-based purples.',
        tip: 'Line lips slightly outside the natural line for fullness.',
      },
      {
        n: 6, name: 'Setting', duration: '2 min',
        desc: 'Warm-toned setting powder with a satin finish. A light dusting of bronzer to set = perfect Autumn glow.',
        tip: '',
      },
    ],
  },
  {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    tone: 'COOL TONE',
    headerGradient: 'linear-gradient(135deg, #E0E8F4, #C0D0E8)',
    nameColor: '#3A5A80',
    swatches: ['#4A6FA5','#8B1A2E','#2E6B5A','#5A3A7A','#C8D4E0'],
    steps: [
      {
        n: 1, name: 'Skin Prep', duration: '3 min',
        desc: 'Hydrating primer with a luminous finish. Winter types suit porcelain, glass-like skin.',
        tip: 'Apply a blue or purple color corrector under eyes for brightness.',
      },
      {
        n: 2, name: 'Foundation', duration: '5 min',
        desc: 'Cool-toned, high-coverage foundation — pink, neutral, or cool beige. Winter skin can handle full coverage beautifully.',
        tip: 'Contour with a cool grey-brown, never an orange-toned bronzer.',
      },
      {
        n: 3, name: 'Blush', duration: '2 min',
        desc: 'Deep rose, cool fuchsia, berry, icy pink. Apply on the cheekbones only — sharp and defined, not diffused.',
        tip: "Winter types can wear bold blush — don't be afraid of colour.",
      },
      {
        n: 4, name: 'Eye Makeup', duration: '8 min',
        desc: 'Navy, charcoal, cool grey, deep plum, icy silver, black. Winter eyes are dramatic and high-contrast.',
        tip: 'Tight-line with jet black for a striking, defined look.',
      },
      {
        n: 5, name: 'Lips', duration: '2 min',
        desc: 'Best: classic red, deep berry, cool fuchsia, dark plum, blue-red. Winter types can wear the boldest lip colors of all seasons.',
        tip: 'A true blue-red lipstick is the signature Winter look.',
      },
      {
        n: 6, name: 'Setting', duration: '2 min',
        desc: 'Translucent or cool-toned setting powder. Finish with a light illuminating mist for glass skin effect.',
        tip: '',
      },
    ],
  },
]

const TABS = [
  { id: 'all',    label: 'All Seasons' },
  { id: 'spring', label: '🌸 Spring'   },
  { id: 'summer', label: '☁️ Summer'   },
  { id: 'autumn', label: '🍂 Autumn'   },
  { id: 'winter', label: '❄️ Winter'   },
]

const DECOR_CIRCLES = [
  { color: '#F4A261', size: 80, label: 'Spring', top: 10,  left: 10  },
  { color: '#B8C5D6', size: 60, label: 'Summer', top: 25,  left: 120 },
  { color: '#C4873A', size: 70, label: 'Autumn', top: 110, left: 55  },
  { color: '#4A6FA5', size: 50, label: 'Winter', top: 155, left: 155 },
]

const UNIVERSAL_TIPS = [
  { icon: '💧', title: 'Skincare first',  body: 'Makeup looks best on well-hydrated skin' },
  { icon: '🎨', title: 'Less is more',    body: 'Build coverage gradually for a natural finish' },
  { icon: '✨', title: 'Blend always',    body: 'No harsh lines — blend every product thoroughly' },
]

function SeasonCard({ season }) {
  const [openStep, setOpenStep] = useState(null)

  const toggle = (n) => setOpenStep((prev) => (prev === n ? null : n))

  return (
    <div className={styles.seasonCard}>

      {/* Card Header */}
      <div className={styles.cardHeader} style={{ background: season.headerGradient }}>
        <div className={styles.cardHeaderTop}>
          <span className={styles.toneBadge}>{season.tone}</span>
        </div>
        <div className={styles.cardHeaderBottom}>
          <h2 className={styles.cardSeasonName} style={{ color: season.nameColor }}>
            {season.emoji} {season.name}
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
        <span className={styles.tutorialLabel}>Complete Makeup Tutorial</span>

        <div className={styles.accordionList}>
          {season.steps.map((step) => (
            <div key={step.n} className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionTrigger}
                onClick={() => toggle(step.n)}
              >
                <div className={styles.accordionLeft}>
                  <span className={styles.stepNum}>{step.n}</span>
                  <span className={styles.stepName}>{step.name}</span>
                  <span className={styles.stepTime}>{step.duration}</span>
                </div>
                <span className={[styles.accordionArrow, openStep === step.n ? styles.accordionArrowOpen : ''].join(' ')}>
                  ▾
                </span>
              </button>

              <div className={[styles.accordionContent, openStep === step.n ? styles.accordionContentOpen : ''].join(' ')}>
                <p className={styles.stepDesc}>{step.desc}</p>
                {step.tip && (
                  <div className={styles.stepTipBox}>
                    <span className={styles.stepTipLabel}>PRO TIP</span>
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SavedLooksPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const visibleSeasons = activeFilter === 'all'
    ? SEASONS_DATA
    : SEASONS_DATA.filter((s) => s.id === activeFilter)

  return (
    <main className={styles.main}>

      {/* ══ Hero ══ */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroBadge}>✦ EXPERT GUIDANCE</span>
            <h1 className={styles.heroTitle}>Beauty Guide</h1>
            <p className={styles.heroSub}>Build your perfect look, season by season.</p>
            <Link to="/tryon" className={styles.heroCta}>Discover My Season →</Link>
          </div>

          <div className={styles.heroRight} aria-hidden="true">
            {DECOR_CIRCLES.map(({ color, size, label, top, left }) => (
              <span
                key={label}
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
              {tab.label}
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

        {/* ══ Pro Tips Banner ══ */}
        <section className={styles.tipsBanner}>
          <h2 className={styles.tipsTitle}>✦ Universal Beauty Rules</h2>
          <div className={styles.tipsRow}>
            {UNIVERSAL_TIPS.map((tip) => (
              <div key={tip.title} className={styles.tipCard}>
                <span className={styles.tipIcon}>{tip.icon}</span>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipBody}>{tip.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  )
}
