import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { analyzePhotoWithTM, setWebcamPrediction, resetAnalysis } from './analysisSlice'
import PhotoUploader from '../../components/PhotoUploader/PhotoUploader'
import AuraScoreMeter from '../../components/AuraScoreMeter/AuraScoreMeter'
import { SEASON_PALETTES } from '../../data/seasons'
import styles from './AnalyzerPage.module.css'

const TM_MODEL_URL = import.meta.env.VITE_TM_MODEL_URL

// Load TM scripts from CDN once per page session
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
  const {
    undertone, season, auraScore, scoringMode, makeupReason,
    skinTone, recommendations, avoidColors, label, allPredictions,
    status, error,
  } = useSelector((s) => s.analysis)

  const [inputMode, setInputMode]     = useState('upload')
  const [modelStatus, setModelStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [localPreview, setLocalPreview] = useState(null)
  const [localMediaType, setLocalMediaType] = useState('image/jpeg')
  const [imgLoaded, setImgLoaded]     = useState(false)

  const modelRef           = useRef(null)
  const webcamRef          = useRef(null)
  const rafRef             = useRef(null)
  const webcamContainerRef = useRef(null)
  const imgRef             = useRef(null)
  const lastDispatchRef    = useRef(0)

  // Load TM model once on mount
  useEffect(() => {
    let cancelled = false
    loadTMScripts()
      .then(() => window.tmImage.load(
        `${TM_MODEL_URL}model.json`,
        `${TM_MODEL_URL}metadata.json`
      ))
      .then((m) => { if (!cancelled) { modelRef.current = m; setModelStatus('ready') } })
      .catch((e) => { console.error('TM model load failed:', e); if (!cancelled) setModelStatus('error') })
    return () => { cancelled = true; stopWebcam() }
  }, [])

  // Start/stop webcam when mode or model readiness changes
  useEffect(() => {
    if (inputMode === 'webcam' && modelStatus === 'ready') startWebcam()
    else stopWebcam()
    return stopWebcam
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, modelStatus])

  function stopWebcam() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (webcamRef.current) { try { webcamRef.current.stop() } catch (_) {} ; webcamRef.current = null }
  }

  async function startWebcam() {
    stopWebcam()
    try {
      const webcam = new window.tmImage.Webcam(280, 280, true)
      await webcam.setup()
      await webcam.play()
      webcamRef.current = webcam
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = ''
        webcamContainerRef.current.appendChild(webcam.canvas)
      }
      const loop = async () => {
        if (!webcamRef.current) return
        webcam.update()
        await runWebcamPredict(webcam.canvas)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch (e) {
      console.error('Webcam error:', e)
    }
  }

  async function runWebcamPredict(canvas) {
    if (!modelRef.current) return
    const predictions = await modelRef.current.predict(canvas)
    const top      = predictions.reduce((a, b) => a.probability > b.probability ? a : b)
    const svayPred = predictions.find((p) => p.className === 'สวย')
    const score    = Math.round((svayPred ?? top).probability * 100)
    const preds    = predictions.map(({ className, probability }) => ({ className, probability }))

    const now = Date.now()
    if (now - lastDispatchRef.current > 500) {
      lastDispatchRef.current = now
      dispatch(setWebcamPrediction({ label: top.className, probability: top.probability, allPredictions: preds, auraScore: score }))
    }
  }

  const handlePhotoSelect = useCallback((dataUrl, mediaType) => {
    setLocalPreview(dataUrl)
    setLocalMediaType(mediaType || 'image/jpeg')
    setImgLoaded(false)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!localPreview || !imgLoaded || modelStatus !== 'ready' || !imgRef.current) return
    const predictions = await modelRef.current.predict(imgRef.current)
    const top      = predictions.reduce((a, b) => a.probability > b.probability ? a : b)
    const svayPred = predictions.find((p) => p.className === 'สวย')
    const score    = Math.round((svayPred ?? top).probability * 100)
    const preds    = predictions.map(({ className, probability }) => ({ className, probability }))
    const base64   = localPreview.split(',')[1]
    dispatch(analyzePhotoWithTM({
      base64Image: base64,
      mediaType: localMediaType,
      label: top.className,
      probability: top.probability,
      allPredictions: preds,
      auraScore: score,
    }))
  }, [localPreview, localMediaType, imgLoaded, modelStatus, dispatch])

  const handleReset = useCallback(() => {
    dispatch(resetAnalysis())
    setLocalPreview(null)
    setImgLoaded(false)
  }, [dispatch])

  const palette = season ? SEASON_PALETTES[season] : null
  const showResults = status === 'succeeded' || (inputMode === 'webcam' && auraScore !== null)

  return (
    <main className={styles.main}>
      <div className={`container ${styles.layout}`}>

        {/* ── Left column ── */}
        <section className={styles.uploadCol}>
          <h1 className={styles.title}>Color Analysis</h1>
          <p className={styles.subtitle}>Upload a photo or use your webcam to discover your personal color season and aura score.</p>

          {/* Mode toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${inputMode === 'upload' ? styles.modeBtnActive : ''}`}
              onClick={() => setInputMode('upload')}
            >
              📷 Upload Photo
            </button>
            <button
              className={`${styles.modeBtn} ${inputMode === 'webcam' ? styles.modeBtnActive : ''}`}
              onClick={() => setInputMode('webcam')}
            >
              🎥 Webcam
            </button>
          </div>

          {/* Model loading / error */}
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

          {/* ── Upload mode ── */}
          {inputMode === 'upload' && (
            <>
              <PhotoUploader
                onPhotoSelect={handlePhotoSelect}
                preview={localPreview}
                disabled={status === 'loading'}
              />
              {localPreview && (
                <img
                  ref={imgRef}
                  src={localPreview}
                  alt=""
                  onLoad={() => setImgLoaded(true)}
                  style={{ display: 'none' }}
                />
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
                  <button
                    className={styles.btnReset}
                    onClick={handleReset}
                    disabled={status === 'loading'}
                  >
                    Reset
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Webcam mode ── */}
          {inputMode === 'webcam' && (
            <div className={styles.webcamWrap}>
              <div ref={webcamContainerRef} className={styles.webcamCanvas} />
              {modelStatus === 'ready' && !webcamRef.current && (
                <p className={styles.webcamHint}>Camera starting…</p>
              )}
              {allPredictions && (
                <div className={styles.predictionBars}>
                  {allPredictions.map(({ className, probability }) => (
                    <div key={className} className={styles.predBar}>
                      <span className={styles.predLabel}>{className}</span>
                      <div className={styles.predTrack}>
                        <div
                          className={styles.predFill}
                          style={{ width: `${Math.round(probability * 100)}%` }}
                        />
                      </div>
                      <span className={styles.predPct}>{Math.round(probability * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={styles.errorBox} role="alert">
              <strong>Analysis failed:</strong> {error}
            </div>
          )}
        </section>

        {/* ── Right column — results ── */}
        <section className={styles.resultsCol}>
          {!showResults && status !== 'loading' && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✦</div>
              <p>Your analysis results will appear here</p>
            </div>
          )}

          {status === 'loading' && (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}><span /><span /><span /></div>
              <p>Analysing your photo…</p>
              <p className={styles.loadingHint}>This may take a moment</p>
            </div>
          )}

          {showResults && (
            <div className={styles.results}>
              {/* Season banner (upload only) */}
              {season && palette && (
                <div className={styles.seasonBanner} style={{ background: palette.gradient }}>
                  <span className={styles.seasonEmoji}>{palette.emoji}</span>
                  <div>
                    <h2 className={styles.seasonName}>{season}</h2>
                    <p className={styles.seasonTagline}>{palette.tagline}</p>
                  </div>
                </div>
              )}

              {/* Score row */}
              <div className={styles.scoreRow}>
                <div className={styles.scoreCol}>
                  <AuraScoreMeter score={auraScore ?? 0} animated />
                  <span className={scoringMode === 'rule' ? styles.badgeRule : styles.badgeAI}>
                    {scoringMode === 'tm'     ? '✦ AI Model'
                     : scoringMode === 'gemini' ? '✦ Gemini AI'
                     : 'Color Analysis'}
                  </span>
                </div>
                <div className={styles.details}>
                  {undertone && (
                    <div className={styles.chip}>
                      <span className={styles.chipLabel}>Undertone</span>
                      <span className={styles.chipValue}>{undertone}</span>
                    </div>
                  )}
                  {skinTone && (
                    <div className={styles.chip}>
                      <span className={styles.chipLabel}>Skin Tone</span>
                      <span className={styles.chipValue}>{skinTone}</span>
                    </div>
                  )}
                  {label && (
                    <div className={styles.chip}>
                      <span className={styles.chipLabel}>Prediction</span>
                      <span className={styles.chipValue}>{label}</span>
                    </div>
                  )}
                </div>
              </div>

              {makeupReason && (
                <p className={styles.makeupFeedback}>{makeupReason}</p>
              )}

              {recommendations?.description && (
                <p className={styles.desc}>{recommendations.description}</p>
              )}

              {recommendations?.colors?.length > 0 && (
                <div className={styles.colorSection}>
                  <h3 className={styles.colorTitle}>Best Colors For You</h3>
                  <div className={styles.colorRow}>
                    {recommendations.colors.map((hex) => (
                      <div key={hex} className={styles.colorChip}>
                        <div className={styles.colorDot} style={{ background: hex }} />
                        <span>{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {avoidColors?.length > 0 && (
                <div className={styles.colorSection}>
                  <h3 className={styles.colorTitleAvoid}>Colors to Avoid</h3>
                  <div className={styles.colorRow}>
                    {avoidColors.map((hex) => (
                      <div key={hex} className={styles.colorChip}>
                        <div className={styles.colorDot} style={{ background: hex, opacity: 0.6 }} />
                        <span>{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {season && (
                <Link to="/tryon" className={styles.tryonBtn}>
                  Try On {season} Colors →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
