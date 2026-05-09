import { useRef, useState, useCallback } from 'react'
import styles from './PhotoUploader.module.css'

export default function PhotoUploader({ onPhotoSelect, preview, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

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
      aria-label="Upload photo"
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
          <img src={preview} alt="Uploaded photo" className={styles.preview} />
          <div className={styles.overlay}>
            <span>Change photo</span>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.icon}>📷</div>
          <p className={styles.primary}>Drop your photo here</p>
          <p className={styles.secondary}>or click to browse — JPG, PNG, WEBP</p>
        </div>
      )}
    </div>
  )
}
