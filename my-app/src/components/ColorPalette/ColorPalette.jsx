import styles from './ColorPalette.module.css'

export default function ColorPalette({ colors = [], selectedHex, onSelect, label }) {
  return (
    <div className={styles.wrapper}>
      {label && <p className={styles.label}>{label}</p>}
      <div className={styles.grid}>
        {colors.map(({ hex, name }) => (
          <button
            key={hex}
            className={[styles.swatch, selectedHex === hex ? styles.selected : ''].join(' ')}
            style={{ '--color': hex }}
            onClick={() => onSelect(hex)}
            title={name}
            aria-label={`${name} — ${hex}`}
            aria-pressed={selectedHex === hex}
          >
            <span className={styles.fill} />
            {selectedHex === hex && <span className={styles.check}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
