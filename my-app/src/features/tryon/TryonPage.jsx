import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setColor, resetColors } from './tryonSlice'
import { setPhoto } from '../analysis/analysisSlice'
import PhotoUploader from '../../components/PhotoUploader/PhotoUploader'
import ColorPalette from '../../components/ColorPalette/ColorPalette'
import AuraScoreMeter from '../../components/AuraScoreMeter/AuraScoreMeter'
import useAuraScore from '../../hooks/useAuraScore'
import { SEASON_PALETTES, COLOR_CATEGORIES } from '../../data/seasons'
import styles from './TryonPage.module.css'

function renderCanvas(canvas, imageSrc, selectedColors, activeCategory) {
  if (!canvas || !imageSrc) return
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = () => {
    canvas.width  = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    const W = canvas.width
    const H = canvas.height

    Object.entries(selectedColors).forEach(([cat, hex]) => {
      if (!hex) return
      ctx.save()
      ctx.globalAlpha = cat === activeCategory ? 0.38 : 0.25
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = hex

      if (cat === 'lipColors') {
        ctx.beginPath()
        ctx.ellipse(W * 0.5, H * 0.79, W * 0.13, H * 0.045, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (cat === 'blushColors') {
        ctx.beginPath()
        ctx.ellipse(W * 0.27, H * 0.63, W * 0.11, H * 0.065, -0.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(W * 0.73, H * 0.63, W * 0.11, H * 0.065, 0.2, 0, Math.PI * 2)
        ctx.fill()
      } else if (cat === 'hairColors') {
        const grad = ctx.createRadialGradient(W * 0.5, 0, W * 0.1, W * 0.5, H * 0.15, W * 0.6)
        grad.addColorStop(0, hex)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H * 0.42)
      } else if (cat === 'eyeShadows') {
        ctx.beginPath()
        ctx.ellipse(W * 0.34, H * 0.43, W * 0.1, H * 0.038, -0.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(W * 0.66, H * 0.43, W * 0.1, H * 0.038, 0.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    })
  }
  img.src = imageSrc
}

export default function TryonPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const canvasRef = useRef(null)
  const auraScore = useAuraScore()

  const { photo: analysisPhoto, season } = useSelector((s) => s.analysis)
  const { selectedColors } = useSelector((s) => s.tryon)

  const [localPhoto, setLocalPhoto] = useState(analysisPhoto || null)
  const [activeTab, setActiveTab]   = useState(COLOR_CATEGORIES[0].key)

  const palette = season ? SEASON_PALETTES[season] : SEASON_PALETTES['Spring']

  useEffect(() => {
    renderCanvas(canvasRef.current, localPhoto, selectedColors, activeTab)
  }, [localPhoto, selectedColors, activeTab])

  const handlePhotoSelect = (dataUrl) => {
    setLocalPhoto(dataUrl)
    dispatch(setPhoto(dataUrl))
  }

  const handleColorSelect = (hex) => {
    dispatch(setColor({ category: activeTab, color: hex }))
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Virtual Try-On</h1>
          <p className={styles.subtitle}>
            Upload your photo, select colors below, and watch them appear on your canvas.
          </p>
        </div>

        <div className={styles.layout}>

          {/* ── Col 1: Canvas ── */}
          <section className={styles.canvasCol}>
            {localPhoto ? (
              <div className={styles.canvasWrapper}>
                <canvas ref={canvasRef} className={styles.canvas} />
                <button className={styles.changePhoto} onClick={() => setLocalPhoto(null)}>
                  Change Photo
                </button>
              </div>
            ) : (
              <PhotoUploader onPhotoSelect={handlePhotoSelect} />
            )}
          </section>

          {/* ── Col 2: Score ── */}
          <section className={styles.scoreCol}>
            <AuraScoreMeter score={auraScore} animated={false} />
          </section>

          {/* ── Col 3: Palette ── */}
          <section className={styles.paletteCol}>
            {!season && (
              <div className={styles.noSeason}>
                <p>
                  No season detected yet.{' '}
                  <a onClick={() => navigate('/analyzer')} className={styles.link}>
                    Run the Analyzer
                  </a>{' '}
                  for personalised palettes, or browse all colors below.
                </p>
              </div>
            )}

            <div className={styles.tabs}>
              {COLOR_CATEGORIES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={[styles.tab, activeTab === key ? styles.tabActive : ''].join(' ')}
                  onClick={() => setActiveTab(key)}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {selectedColors[key] && (
                    <span className={styles.tabDot} style={{ background: selectedColors[key] }} />
                  )}
                </button>
              ))}
            </div>

            <div className={styles.paletteCard}>
              <ColorPalette
                colors={palette[activeTab] || []}
                selectedHex={selectedColors[activeTab]}
                onSelect={handleColorSelect}
                label={season ? `${season} — ${COLOR_CATEGORIES.find(c => c.key === activeTab)?.label}` : undefined}
              />
              {selectedColors[activeTab] && (
                <div className={styles.selectedInfo}>
                  <div className={styles.selectedDot} style={{ background: selectedColors[activeTab] }} />
                  <span className={styles.selectedHex}>{selectedColors[activeTab]}</span>
                  <span className={styles.selectedName}>
                    {palette[activeTab]?.find(c => c.hex === selectedColors[activeTab])?.name}
                  </span>
                </div>
              )}
            </div>

            {Object.keys(selectedColors).length > 0 && (
              <div className={styles.summary}>
                <h3 className={styles.summaryTitle}>Selected Colors</h3>
                {COLOR_CATEGORIES.map(({ key, label, icon }) =>
                  selectedColors[key] ? (
                    <div key={key} className={styles.summaryRow}>
                      <span>{icon} {label}</span>
                      <div className={styles.summaryRight}>
                        <div className={styles.summaryDot} style={{ background: selectedColors[key] }} />
                        <span className={styles.summaryHex}>{selectedColors[key]}</span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            <button
              className={styles.btnReset}
              onClick={() => dispatch(resetColors())}
              disabled={Object.keys(selectedColors).length === 0}
            >
              Clear All Colors
            </button>
          </section>

        </div>
      </div>
    </main>
  )
}
