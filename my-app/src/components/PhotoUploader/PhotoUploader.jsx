import { useRef, useState, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './PhotoUploader.module.css'

export default function PhotoUploader({ onPhotoSelect, preview, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const { t } = useTranslation()

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onPhotoSelect(e.target.result, file.type)
    reader.readAsDataURL(file)
  }, [onPhotoSelect])

  const handleChange = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={[styles.zone, dragging ? styles.dragging : '', disabled ? styles.disabled : ''].join(' ')}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label={t('analyzer_drop')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hidden}
        onChange={handleChange}
        disabled={disabled}
      />

      {preview ? (
        <div className={styles.previewWrapper}>
          <img src={preview} alt={t('analyzer_drop')} className={styles.preview} />
          <div className={styles.overlay}>
            <span>{t('analyzer_change_photo')}</span>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.iconWrap}>
            <span className={styles.icon}>📷</span>
          </div>
          <p className={styles.primary}>{t('analyzer_drop')}</p>
          <p className={styles.secondary}>{t('analyzer_browse')}</p>
        </div>
      )}
    </div>
  )
}
