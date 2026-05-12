import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { analyzePhotoWithTM, resetAnalysis, setPhoto } from './analysisSlice'
import PhotoUploader from '../../components/PhotoUploader/PhotoUploader'
import styles from './AnalyzerPage.module.css'

const TM_MODEL_URL = import.meta.env.VITE_TM_MODEL_URL

function getTopCategory(scores) {
  if (!scores) return null
  if (scores.excellent >= scores.good && scores.excellent >= scores.fair) return 'excellent'
  if (scores.good >= scores.fair) return 'good'
  return 'fair'
}

function getBand(scores) {
  const top = getTopCategory(scores)
  if (top === 'excellent') return { label: 'Perfect Harmony ✨', css: 'bandPerfect',    desc: 'The color is perfect, helping to brighten and enhance your skin tone.' }
  if (top === 'good')      return { label: 'Good Fit 👍',        css: 'bandGoodFit',    desc: 'This color complements your skin tone well with a vibrant, harmonious look.' }
  return                          { label: 'Fair Match ⚠️',      css: 'bandMismatched', desc: 'The color may clash slightly with your skin tone, making the face look less vibrant.' }
}

function getDescription(scores) {
  const top = getTopCategory(scores)
  if (top === 'excellent') return 'Your color choices are an excellent match for your skin tone. These shades brighten and enhance your natural complexion beautifully — wear them with confidence!'
  if (top === 'good')      return 'Your colors work reasonably well with your skin tone. Some shades complement you nicely, though a few adjustments could bring out even more vibrancy in your look.'
  return 'Some of your color choices may be clashing with your skin tone, making your complexion appear less vibrant. Try switching to shades that better align with your undertone.'
}

const SCORE_BARS = [
  { key: 'excellent', label: 'Excellent', color: '#7EC8A0' },
  { key: 'good',      label: 'Good',      color: '#D4877A' },
  { key: 'fair',      label: 'Fair',      color: '#8B9EB0' },
]

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

export default function AnalyzerPage() {
  const dispatch = useDispatch()
  const { season, scores, scoringMode, status, error } = useSelector((s) => s.analysis)

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

    const round = (v) => Math.round(v * 1000) / 10
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

  const band = scores ? getBand(scores) : null

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Color Analysis</h1>
          <p className={styles.subtitle}>Upload a clear, well-lit photo to discover your personal color season and match scores.</p>
        </div>

        <div className={styles.layout}>

          {/* ── Col 1: Upload ── */}
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

            <PhotoUploader
              onPhotoSelect={handlePhotoSelect}
              preview={localPreview}
              disabled={status === 'loading'}
            />
            {localPreview && (
              <img ref={imgRef} src={localPreview} alt=""
                onLoad={() => setImgLoaded(true)} style={{ display: 'none' }} />
            )}

            <div className={styles.actions}>
              <button
                className={styles.btnAnalyze}
                onClick={handleAnalyze}
                disabled={!localPreview || !imgLoaded || status === 'loading' || modelStatus !== 'ready'}
              >
                {status === 'loading'
                  ? <><span className={styles.spinner} /> Analyzing…</>
                  : 'Analyze My Colors'}
              </button>
              {status !== 'idle' && (
                <button className={styles.btnReset} onClick={handleReset} disabled={status === 'loading'}>
                  Reset
                </button>
              )}
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <strong>Analysis failed:</strong> {error}
              </div>
            )}
          </section>

          {/* ── Col 2: Score bars ── */}
          <section className={styles.midCol}>
            {status === 'idle' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✦</div>
                <p>Your scores will appear here</p>
              </div>
            )}
            {status === 'loading' && (
              <div className={styles.loadingState}>
                <div className={styles.loadingDots}><span /><span /><span /></div>
                <p>Analysing your photo…</p>
                <p className={styles.loadingHint}>This may take a moment</p>
              </div>
            )}
            {status === 'succeeded' && scores && (
              <div className={styles.scoreBarsCard}>
                <div className={styles.scoreBarsHeader}>
                  <span className={styles.scoreBarsTitle}>Match Scores</span>
                  <span className={scoringMode === 'tm' ? styles.badgeAI : styles.badgeRule}>
                    {scoringMode === 'tm' ? '✦ AI Model' : 'Color Analysis'}
                  </span>
                </div>
                {SCORE_BARS.map(({ key, label, color }) => (
                  <div key={key} className={styles.scoreBarRow}>
                    <span className={styles.scoreBarLabel}>{label}</span>
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
            )}
          </section>

          {/* ── Col 3: Band label + description ── */}
          <section className={styles.rightCol}>
            {status === 'succeeded' && band && (
              <>
                <div className={styles[band.css]}>
                  <strong>{band.label}</strong>
                  <p>{band.desc}</p>
                </div>
                <p className={styles.desc}>{getDescription(scores)}</p>
              </>
            )}
          </section>

          {status === 'succeeded' && season && (
            <div className={styles.tryonRow}>
              <Link to="/tryon" className={styles.tryonBtn}>
                Take the Color Quiz →
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
