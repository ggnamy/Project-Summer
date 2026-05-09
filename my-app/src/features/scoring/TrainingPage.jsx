import { useRef, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addTrainingExample,
  removeExample,
  trainModel,
  resetModel,
  checkSavedModel,
} from './scoringSlice'
import styles from './TrainingPage.module.css'

const MIN_PER_CLASS = 5

function ExampleGrid({ label, examples, onAdd, onRemove, isLoading }) {
  const inputRef = useRef(null)
  const isBeautiful = label === 1

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => onAdd(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className={[styles.column, isBeautiful ? styles.colBeautiful : styles.colNot].join(' ')}>
      <div className={styles.colHeader}>
        <span className={styles.colIcon}>{isBeautiful ? '✨' : '📷'}</span>
        <div>
          <h3 className={styles.colTitle}>
            {isBeautiful ? 'Beautiful' : 'Not Beautiful'}
          </h3>
          <p className={styles.colCount}>{examples.length} photo{examples.length !== 1 ? 's' : ''}</p>
        </div>
        <span
          className={[
            styles.countBadge,
            examples.length >= MIN_PER_CLASS ? styles.badgeReady : styles.badgeInsufficient,
          ].join(' ')}
        >
          {examples.length >= MIN_PER_CLASS ? '✓ Ready' : `${MIN_PER_CLASS - examples.length} more needed`}
        </span>
      </div>

      <div className={styles.grid}>
        {examples.map((ex) => (
          <div key={ex.id} className={styles.thumb}>
            <img src={ex.preview} alt="" className={styles.thumbImg} />
            <button
              className={styles.removeBtn}
              onClick={() => onRemove(ex.id)}
              aria-label="Remove"
            >×</button>
          </div>
        ))}

        <button
          className={styles.addBtn}
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
        >
          <span>+</span>
          <span className={styles.addLabel}>Add Photos</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hidden}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

export default function TrainingPage() {
  const dispatch = useDispatch()
  const { examples, modelStatus, trainingProgress, finalAccuracy, modelExists, error } =
    useSelector((s) => s.scoring)

  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    dispatch(checkSavedModel())
  }, [dispatch])

  const beautiful    = examples.filter(e => e.label === 1)
  const notBeautiful = examples.filter(e => e.label === 0)
  const canTrain     = beautiful.length >= MIN_PER_CLASS && notBeautiful.length >= MIN_PER_CLASS
  const isLoading    = modelStatus === 'extracting' || modelStatus === 'training'

  const handleAdd = useCallback((dataUrl, label) => {
    dispatch(addTrainingExample({ dataUrl, label }))
  }, [dispatch])

  const handleTrain = () => dispatch(trainModel())

  const handleReset = () => {
    dispatch(resetModel())
    setConfirmReset(false)
  }

  const progressPct = trainingProgress.total > 0
    ? Math.round((trainingProgress.epoch / trainingProgress.total) * 100)
    : 0

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Train Beauty Model</h1>
            <p className={styles.subtitle}>
              Upload example photos for each category. The model learns the difference and scores new photos from 0–100.
            </p>
          </div>
          {modelExists && (
            <div className={styles.modelBadge}>
              <span className={styles.modelDot} />
              Model Ready · {finalAccuracy != null ? `${finalAccuracy}% accuracy` : 'Loaded'}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className={styles.steps}>
          {[
            { n: '1', text: `Upload at least ${MIN_PER_CLASS} "Beautiful" photos` },
            { n: '2', text: `Upload at least ${MIN_PER_CLASS} "Not Beautiful" photos` },
            { n: '3', text: 'Click Train — the model learns in your browser' },
            { n: '4', text: 'Go to Analyzer — your photo is scored 0–100' },
          ].map(s => (
            <div key={s.n} className={styles.step}>
              <span className={styles.stepN}>{s.n}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>

        {/* Upload columns */}
        <div className={styles.columns}>
          <ExampleGrid
            label={1}
            examples={beautiful}
            onAdd={(d) => handleAdd(d, 1)}
            onRemove={(id) => dispatch(removeExample(id))}
            isLoading={isLoading}
          />
          <ExampleGrid
            label={0}
            examples={notBeautiful}
            onAdd={(d) => handleAdd(d, 0)}
            onRemove={(id) => dispatch(removeExample(id))}
            isLoading={isLoading}
          />
        </div>

        {/* Extracting indicator */}
        {modelStatus === 'extracting' && (
          <div className={styles.infoBox}>
            <span className={styles.spinner} />
            Extracting features from photo…
          </div>
        )}

        {error && (
          <div className={styles.errorBox}><strong>Error:</strong> {error}</div>
        )}

        {/* Train button */}
        <div className={styles.trainRow}>
          <button
            className={styles.btnTrain}
            onClick={handleTrain}
            disabled={!canTrain || isLoading}
          >
            {modelStatus === 'training' ? (
              <><span className={styles.spinner} /> Training… {progressPct}%</>
            ) : modelExists ? (
              'Re-Train Model'
            ) : (
              'Train Model'
            )}
          </button>

          {(modelExists || examples.length > 0) && !confirmReset && (
            <button className={styles.btnReset} onClick={() => setConfirmReset(true)}>
              Reset Model
            </button>
          )}
          {confirmReset && (
            <div className={styles.confirmRow}>
              <span>Delete model and all examples?</span>
              <button className={styles.btnConfirmReset} onClick={handleReset}>Yes, Reset</button>
              <button className={styles.btnCancelReset} onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          )}
        </div>

        {/* Training progress */}
        {modelStatus === 'training' && (
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span>Training — Epoch {trainingProgress.epoch} / {trainingProgress.total}</span>
              <span className={styles.progressAcc}>
                Accuracy: {Math.round((trainingProgress.accuracy ?? 0) * 100)}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Success */}
        {modelStatus === 'ready' && (
          <div className={styles.successBox}>
            <span>✓</span>
            <div>
              <strong>Model trained successfully!</strong>
              {finalAccuracy != null && (
                <span className={styles.accuracy}> Training accuracy: {finalAccuracy}%</span>
              )}
              <p>Go to the <a href="/analyzer" className={styles.link}>Analyzer page</a> and upload a photo to see your beauty score.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
