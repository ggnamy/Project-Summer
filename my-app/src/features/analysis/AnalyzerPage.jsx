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
  { key: 'excellent', tKey: 'analyzer_excellent', color: '#52b788' },
  { key: 'good',      tKey: 'analyzer_good',      color: '#D4877A' },
  { key: 'fair',      tKey: 'analyzer_fair',      color: '#8B9EB0' },
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
    if (excellent >= 90) return { labelKey: 'band_perfect_label', css: 'bandPerfect',    descKey: 'band_perfect_desc', vars: { pct: excellent.toFixed(1) } }
    if (excellent >= 70) return { labelKey: 'band_strong_label',  css: 'bandPerfect',    descKey: 'band_strong_desc',  vars: { pct: excellent.toFixed(1) } }
    return                      { labelKey: 'band_goodfit_label', css: 'bandGoodFit',    descKey: 'band_goodfit_desc', vars: { pct: excellent.toFixed(1) } }
  }
  if (top === 'good') return { labelKey: 'band_decent_label', css: 'bandGoodFit',   descKey: 'band_decent_desc', vars: { pct: good.toFixed(1) } }
  if (fair >= 80)    return { labelKey: 'band_clash_label',  css: 'bandClash',      descKey: 'band_clash_desc',  vars: { pct: fair.toFixed(1) } }
  return                    { labelKey: 'band_fair_label',   css: 'bandMismatched', descKey: 'band_fair_desc',   vars: { pct: fair.toFixed(1) } }
}

function getRecommendations(scores, season) {
  const { excellent, good, fair } = scores
  const top = getTopCategory(scores)

  if (excellent >= 90) return {
    headlineKey: 'reco_perfect_headline',
    introKey: 'reco_perfect_intro', vars: { pct: excellent.toFixed(1), season },
    tipKeys: ['reco_tip_perfect1', 'reco_tip_perfect2', 'reco_tip_perfect3'],
  }
  if (excellent >= 70) return {
    headlineKey: 'reco_strong_headline',
    introKey: 'reco_strong_intro', vars: { pct: excellent.toFixed(1), season },
    tipKeys: ['reco_tip_strong1', 'reco_tip_strong2', 'reco_tip_strong3'],
  }
  if (top === 'excellent') return {
    headlineKey: 'reco_decent_headline',
    introKey: 'reco_decent_intro', vars: { pct: excellent.toFixed(1), season },
    tipKeys: ['reco_tip_decent1', 'reco_tip_decent2', 'reco_tip_decent3'],
  }
  if (top === 'good') return {
    headlineKey: 'reco_good_headline',
    introKey: 'reco_good_intro', vars: { pct: good.toFixed(1), season },
    tipKeys: ['reco_tip_good1', 'reco_tip_good2', 'reco_tip_good3'],
  }
  if (fair >= 80) return {
    headlineKey: 'reco_clash_headline',
    introKey: 'reco_clash_intro', vars: { pct: fair.toFixed(1), season },
    tipKeys: ['reco_tip_clash1', 'reco_tip_clash2', 'reco_tip_clash3'],
  }
  return {
    headlineKey: 'reco_fair_headline',
    introKey: 'reco_fair_intro', vars: { pct: fair.toFixed(1), season },
    tipKeys: ['reco_tip_fair1', 'reco_tip_fair2', 'reco_tip_fair3'],
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
  const seasonT = season ? t(`season_${season.toLowerCase()}`) : ''
  const band    = scores ? getBand(scores)                          : null
  const reco    = scores ? getRecommendations(scores, seasonT)      : null
  const style   = season ? SEASON_STYLES[season]                    : null

  return (
    <main className={styles.main}>
      <div className="container">

        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>{t('analyzer_badge')}</span>
          <h1 className={styles.title}>{t('analyzer_title')}</h1>
          <p className={styles.subtitle}>{t('analyzer_sub')}</p>
        </div>

        <div className={styles.layout}>

          {/* ══ LEFT: Upload panel ══ */}
          <section className={styles.uploadCol}>

            {modelStatus === 'loading' && (
              <div className={styles.modelLoading}>
                <span className={styles.spinner} /> {t('analyzer_loading_model')}
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
                <strong>{t('analyzer_error_prefix')}</strong> {error}
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
                <p className={styles.emptyTitle}>{t('analyzer_results_empty_title')}</p>
                <p className={styles.emptyHint}>{t('analyzer_results_empty_sub')}</p>
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
                      <span className={styles.cardTitle}>{t('analyzer_match_scores')}</span>
                      <span className={scoringMode === 'tm' ? styles.badgeAI : styles.badgeRule}>
                        {scoringMode === 'tm' ? t('analyzer_ai_badge') : t('analyzer_color_badge')}
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
                    <strong className={styles.bandLabel}>{t(band.labelKey)}</strong>
                    <p className={styles.bandDesc}>{t(band.descKey, band.vars)}</p>
                  </div>
                )}

                {/* Recommendations */}
                {reco && (
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTitle}>{t('analyzer_recommendations')}</span>
                    </div>
                    <p className={styles.recoHeadline}>{t(reco.headlineKey)}</p>
                    <p className={styles.recoIntro}>{t(reco.introKey, reco.vars)}</p>
                    <ul className={styles.tipList}>
                      {reco.tipKeys.map((key, i) => (
                        <li key={i} className={styles.tipItem}>
                          <span className={styles.tipCheck}>✓</span>
                          <span>{t(key, { season: reco.vars.season })}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                {season && (
                  <Link to="/tryon" className={styles.ctaBtn}>
                    {t('analyzer_cta_quiz')}
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
