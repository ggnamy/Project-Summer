import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { analyzePhotoWithTM, resetAnalysis, setPhoto } from './analysisSlice'
import PhotoUploader from '../../components/PhotoUploader/PhotoUploader'
import PhotoTips from '../../components/PhotoTips/PhotoTips'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './AnalyzerPage.module.css'

const TM_MODEL_URL = import.meta.env.VITE_TM_MODEL_URL

/* ── Season visual config ── */
const SEASON_STYLES = {
  Spring: { gradient: 'linear-gradient(135deg, #FFD54F 0%, #FF8A65 50%, #F48FB1 100%)', emoji: '🌸', undertone: 'Warm Tone' },
  Summer: { gradient: 'linear-gradient(135deg, #CE93D8 0%, #90CAF9 50%, #80CBC4 100%)', emoji: '🌊', undertone: 'Cool Tone' },
  Autumn: { gradient: 'linear-gradient(135deg, #FF8F00 0%, #BF360C 50%, #4E342E 100%)', emoji: '🍂', undertone: 'Warm Tone' },
  Winter: { gradient: 'linear-gradient(135deg, #1565C0 0%, #6A1B9A 50%, #1B1B1B 100%)', emoji: '❄️', undertone: 'Cool Tone' },
}

const SCORE_BARS = [
  { key: 'excellent', tKey: 'score_excellent', color: '#52b788' },
  { key: 'good',      tKey: 'score_good',      color: '#D4877A' },
  { key: 'fair',      tKey: 'score_fair',      color: '#8B9EB0' },
]

function getTopCategory(scores) {
  if (!scores) return null
  if (scores.excellent >= scores.good && scores.excellent >= scores.fair) return 'excellent'
  if (scores.good >= scores.fair) return 'good'
  return 'fair'
}

function getBand(scores) {
  const { excellent, good, fair } = scores
  const top = getTopCategory(scores)
  if (top === 'excellent') {
    if (excellent >= 90) return { label: 'Perfect Harmony ✨', css: 'bandPerfect',  desc: `${excellent.toFixed(1)}% Excellent — these colors are an outstanding match for your skin tone.` }
    if (excellent >= 70) return { label: 'Strong Match 💚',    css: 'bandPerfect',  desc: `${excellent.toFixed(1)}% Excellent — these colors complement your complexion beautifully.` }
    return                      { label: 'Good Fit 👍',         css: 'bandGoodFit', desc: `${excellent.toFixed(1)}% Excellent — these colors work reasonably well with your skin tone.` }
  }
  if (top === 'good') return { label: 'Decent Fit 🔵', css: 'bandGoodFit',    desc: `${good.toFixed(1)}% Good — moderate compatibility. Some adjustments could improve the match.` }
  if (fair >= 80)    return { label: 'Strong Clash 🔴', css: 'bandClash',      desc: `${fair.toFixed(1)}% Fair — significant color clash detected with your skin tone.` }
  return                    { label: 'Fair Match ⚠️',   css: 'bandMismatched', desc: `${fair.toFixed(1)}% Fair — slight clashing detected. Season-matched colors are recommended.` }
}

function getRecommendations(scores, season) {
  const { excellent, good, fair } = scores
  const top   = getTopCategory(scores)
  const sName = season ?? 'your'

  if (excellent >= 90) return {
    headline: 'Near-perfect color harmony!',
    intro: `A ${excellent.toFixed(1)}% Excellent score means these colors are exceptionally well-suited to your ${sName} complexion — your choices are outstanding.`,
    tips: [
      `Your ${sName} undertone absolutely loves these colors — keep wearing this palette`,
      'Add accessories in similar tones to extend the harmonious effect',
      'Try bolder or more saturated versions of these shades for special occasions',
    ],
  }
  if (excellent >= 70) return {
    headline: 'Strong color harmony',
    intro: `${excellent.toFixed(1)}% Excellent — these colors work beautifully for your ${sName} complexion. Your choices are well-suited to your undertone.`,
    tips: [
      `These shades align well with your ${sName} undertone — wear them confidently`,
      'Combine the best-performing tones together for maximum polish',
      'Explore deeper or lighter variations to add dimension without losing harmony',
    ],
  }
  if (top === 'excellent') return {
    headline: 'Decent color harmony',
    intro: `Your colors show ${excellent.toFixed(1)}% Excellent compatibility with your ${sName} complexion. A few targeted adjustments could bring this significantly higher.`,
    tips: [
      `Compare your current shades with the recommended ${sName} palette`,
      'Focus on tones that score highest in Excellent for future outfit choices',
      'Avoid shades that skew too far from your undertone',
    ],
  }
  if (top === 'good') return {
    headline: 'Good compatibility, room to grow',
    intro: `${good.toFixed(1)}% Good compatibility detected for your ${sName} skin tone. Small palette adjustments could push this into the Excellent range.`,
    tips: [
      `Shift gradually toward your core ${sName} palette for more vibrant results`,
      'Pair the best-matching shades together to maximize visual impact',
      'Use the recommended color swatches below as a starting reference',
    ],
  }
  if (fair >= 80) return {
    headline: 'Significant color mismatch',
    intro: `A ${fair.toFixed(1)}% Fair score indicates these colors clash noticeably with your ${sName} skin tone. Switching to season-matched shades could visibly transform your look.`,
    tips: [
      `Swap these colors for shades from your ${sName} palette`,
      'Avoid colors that compete directly with your undertone, especially near your face',
      'Take the Color Quiz for a complete personal color season guide',
    ],
  }
  return {
    headline: 'Color refinement recommended',
    intro: `${fair.toFixed(1)}% Fair — these colors have some clashing with your ${sName} undertone. Switching to better-matched shades would noticeably enhance your complexion.`,
    tips: [
      `Explore the recommended ${sName} colors`,
      'Try softer or warmer/cooler variations of your current shades first',
      'Take the Color Quiz for deeper guidance on your personal color season',
    ],
  }
}

/* ── TM script loader ── */
let _tmLoadPromise = null
function loadTMScripts() {
  if (_tmLoadPromise) return _tmLoadPromise
  _tmLoadPromise = new Promise((resolve, reject) => {
    if (window.tmImage) return resolve()
    const tfScript = document.createElement('script')
    tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
    tfScript.onload = () => {
      const tmScript = document.createElement('script')
      tmScript.src = 'https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js'
      tmScript.onload = resolve
      tmScript.onerror = reject
      document.head.appendChild(tmScript)
    }
    tfScript.onerror = reject
    document.head.appendChild(tfScript)
  })
  return _tmLoadPromise
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
export default function AnalyzerPage() {
  const dispatch = useDispatch()
  const {
    season, scores, scoringMode,
    recommendations, status, error,
  } = useSelector((s) => s.analysis)

  const [modelStatus, setModelStatus]       = useState('loading')
  const [localPreview, setLocalPreview]     = useState(null)
  const [localMediaType, setLocalMediaType] = useState('image/jpeg')
  const [imgLoaded, setImgLoaded]           = useState(false)

  const modelRef = useRef(null)
  const imgRef   = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadTMScripts()
      .then(() => window.tmImage.load(`${TM_MODEL_URL}model.json`, `${TM_MODEL_URL}metadata.json`))
      .then((m) => { if (!cancelled) { modelRef.current = m; setModelStatus('ready') } })
      .catch((e) => { console.error('TM model load failed:', e); if (!cancelled) setModelStatus('error') })
    return () => { cancelled = true }
  }, [])

  const handlePhotoSelect = useCallback((dataUrl, mediaType) => {
    setLocalPreview(dataUrl)
    setLocalMediaType(mediaType || 'image/jpeg')
    setImgLoaded(false)
    dispatch(setPhoto(dataUrl))
  }, [dispatch])

  const handleAnalyze = useCallback(async () => {
    if (!localPreview || !imgLoaded || modelStatus !== 'ready' || !imgRef.current) return
    const predictions = await modelRef.current.predict(imgRef.current)
    const top      = predictions.reduce((a, b) => a.probability > b.probability ? a : b)
    const findProb = (name) =>
      predictions.find((p) => p.className.toLowerCase() === name.toLowerCase())?.probability ?? 0

    let excellent = findProb('excellent')
    let good      = findProb('good')
    let fair      = findProb('fair')
    if (excellent === 0 && good === 0 && fair === 0) {
      excellent = predictions[0]?.probability ?? 0
      good      = predictions[1]?.probability ?? 0
      fair      = predictions[2]?.probability ?? 0
    }

    const round     = (v) => Math.round(v * 1000) / 10
    const newScores = { excellent: round(excellent), good: round(good), fair: round(fair) }
    const preds     = predictions.map(({ className, probability }) => ({ className, probability }))
    const base64    = localPreview.split(',')[1]

    dispatch(analyzePhotoWithTM({
      base64Image: base64, mediaType: localMediaType,
      label: top.className, probability: top.probability,
      allPredictions: preds, scores: newScores,
    }))
  }, [localPreview, localMediaType, imgLoaded, modelStatus, dispatch])

  const handleReset = useCallback(() => {
    dispatch(resetAnalysis())
    setLocalPreview(null)
    setImgLoaded(false)
  }, [dispatch])

  const { t } = useTranslation()
  const band  = scores ? getBand(scores)                    : null
  const reco  = scores ? getRecommendations(scores, season) : null
  const style = season ? SEASON_STYLES[season]              : null

  return (
    <main className={styles.main}>
      <div className="container">

        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>{t('analyzer_eyebrow')}</span>
          <h1 className={styles.title}>{t('analyzer_title')}</h1>
          <p className={styles.subtitle}>{t('analyzer_sub')}</p>
        </div>

        <div className={styles.layout}>

          {/* ══ LEFT: Upload panel ══ */}
          <section className={styles.uploadCol}>

            {modelStatus === 'loading' && (
              <div className={styles.modelLoading}>
                <span className={styles.spinner} /> Loading AI model…
              </div>
            )}
            {modelStatus === 'error' && (
              <div className={styles.warnBox}>
                Could not load the AI model. Check <code>VITE_TM_MODEL_URL</code> in your <code>.env</code>.
              </div>
            )}

            <div className={styles.uploaderWrap}>
              <PhotoUploader
                onPhotoSelect={handlePhotoSelect}
                preview={localPreview}
                disabled={status === 'loading'}
              />
            </div>

            {localPreview && (
              <img ref={imgRef} src={localPreview} alt=""
                onLoad={() => setImgLoaded(true)} style={{ display: 'none' }} />
            )}

            <PhotoTips />

            <div className={styles.actions}>
              <button
                className={styles.btnAnalyze}
                onClick={handleAnalyze}
                disabled={!localPreview || !imgLoaded || status === 'loading' || modelStatus !== 'ready'}
              >
                {status === 'loading'
                  ? <><span className={styles.spinnerBtn} /> {t('btn_analyzing')}</>
                  : t('btn_analyze_colors')}
              </button>
              {status !== 'idle' && (
                <button className={styles.btnReset} onClick={handleReset} disabled={status === 'loading'}>
                  {t('btn_reset')}
                </button>
              )}
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <strong>Analysis failed:</strong> {error}
              </div>
            )}

          </section>

          {/* ══ RIGHT: Results panel ══ */}
          <section className={styles.resultsCol}>

            {/* Idle empty state */}
            {status === 'idle' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrap}>
                  <span className={styles.emptyIcon}>✦</span>
                </div>
                <p className={styles.emptyTitle}>Your results will appear here</p>
                <p className={styles.emptyHint}>Upload a photo and click Analyze to get started</p>
              </div>
            )}

            {/* Skeleton loading */}
            {status === 'loading' && (
              <div className={styles.skeletonStack}>
                <div className={[styles.skelCard, styles.skelCardShort].join(' ')} />
                <div className={[styles.skelCard, styles.skelCardMed].join(' ')} />
                <div className={[styles.skelCard, styles.skelCardTall].join(' ')} />
              </div>
            )}

            {/* Results */}
            {status === 'succeeded' && (
              <div className={styles.resultsStack}>

                {/* Match scores */}
                {scores && (
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTitle}>{t('match_scores')}</span>
                      <span className={scoringMode === 'tm' ? styles.badgeAI : styles.badgeRule}>
                        {scoringMode === 'tm' ? '✦ AI Model' : 'Color Analysis'}
                      </span>
                    </div>
                    <div className={styles.scoreBars}>
                      {SCORE_BARS.map(({ key, tKey, color }) => (
                        <div key={key} className={styles.scoreBarRow}>
                          <span className={styles.scoreBarLabel}>{t(tKey)}</span>
                          <div className={styles.scoreBarTrack}>
                            <div
                              className={styles.scoreBarFill}
                              style={{ width: `${scores[key]}%`, background: color }}
                            />
                          </div>
                          <span className={styles.scoreBarPct}>{scores[key].toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Band interpretation */}
                {band && (
                  <div className={[styles.card, styles[band.css]].join(' ')}>
                    <strong className={styles.bandLabel}>{band.label}</strong>
                    <p className={styles.bandDesc}>{band.desc}</p>
                  </div>
                )}

                {/* Recommendations */}
                {reco && (
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTitle}>{t('recommendations')}</span>
                    </div>
                    <p className={styles.recoHeadline}>{reco.headline}</p>
                    <p className={styles.recoIntro}>{reco.intro}</p>
                    <ul className={styles.tipList}>
                      {reco.tips.map((tip, i) => (
                        <li key={i} className={styles.tipItem}>
                          <span className={styles.tipCheck}>✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                {season && (
                  <Link to="/tryon" className={styles.ctaBtn}>
                    Take the Color Quiz →
                  </Link>
                )}

              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  )
}
