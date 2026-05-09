import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchLooks, deleteLook, updateLook } from '../features/tryon/tryonSlice'
import { SEASON_PALETTES, COLOR_CATEGORIES } from '../data/seasons'
import styles from './SavedLooksPage.module.css'

function LookCard({ look, onDelete, onEdit }) {
  const palette = SEASON_PALETTES[look.season]

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} style={{ background: palette?.gradient }}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.cardEmoji}>{palette?.emoji || '✦'}</span>
          <div>
            <h3 className={styles.cardName}>{look.name}</h3>
            <p className={styles.cardSeason}>{look.season} · {look.undertone}</p>
          </div>
        </div>
        <div className={styles.cardScore}>{look.auraScore}</div>
      </div>

      <div className={styles.cardBody}>
        {/* Color swatches */}
        <div className={styles.swatchRow}>
          {COLOR_CATEGORIES.map(({ key, icon }) =>
            look.selectedColors?.[key] ? (
              <div key={key} className={styles.swatch} title={`${icon} ${look.selectedColors[key]}`}>
                <div className={styles.swatchDot} style={{ background: look.selectedColors[key] }} />
              </div>
            ) : null
          )}
          {Object.keys(look.selectedColors || {}).length === 0 && (
            <span className={styles.noColors}>No colors saved</span>
          )}
        </div>

        <p className={styles.cardDate}>
          {new Date(look.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </p>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.btnEdit} onClick={() => onEdit(look)}>Edit Name</button>
        <button className={styles.btnDelete} onClick={() => onDelete(look.id)}>Delete</button>
      </div>
    </div>
  )
}

export default function SavedLooksPage() {
  const dispatch = useDispatch()
  const { savedLooks, status, error } = useSelector((s) => s.tryon)

  const [editingId, setEditingId]     = useState(null)
  const [editName, setEditName]       = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterSeason, setFilterSeason]  = useState('All')

  useEffect(() => {
    dispatch(fetchLooks())
  }, [dispatch])

  const handleDelete = (id) => {
    dispatch(deleteLook(id))
    setDeleteConfirm(null)
  }

  const handleEditSave = (look) => {
    if (!editName.trim()) return
    dispatch(updateLook({ id: look.id, look: { ...look, name: editName.trim() } }))
    setEditingId(null)
  }

  const seasons = ['All', ...Object.keys(SEASON_PALETTES)]
  const filtered = filterSeason === 'All'
    ? savedLooks
    : savedLooks.filter(l => l.season === filterSeason)

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Saved Looks</h1>
            <p className={styles.subtitle}>{savedLooks.length} looks saved</p>
          </div>
          <Link to="/tryon" className={styles.btnNew}>+ New Look</Link>
        </div>

        {/* Season filter */}
        <div className={styles.filters}>
          {seasons.map((s) => (
            <button
              key={s}
              className={[styles.filterBtn, filterSeason === s ? styles.filterActive : ''].join(' ')}
              onClick={() => setFilterSeason(s)}
            >
              {s !== 'All' ? SEASON_PALETTES[s]?.emoji + ' ' : ''}
              {s}
            </button>
          ))}
        </div>

        {/* States */}
        {status === 'loading' && (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>Loading your looks…</p>
          </div>
        )}

        {status === 'failed' && (
          <div className={styles.errorBox}>
            <strong>Couldn&apos;t load saved looks.</strong> {error}
            <br />
            <small>Make sure VITE_API_URL is set correctly in your .env file.</small>
          </div>
        )}

        {status === 'succeeded' && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <p>
              {filterSeason === 'All'
                ? 'No looks saved yet.'
                : `No ${filterSeason} looks saved.`}
            </p>
            <Link to="/tryon" className={styles.btnNew}>Create Your First Look</Link>
          </div>
        )}

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((look) => (
            editingId === look.id ? (
              <div key={look.id} className={styles.editCard}>
                <h3 className={styles.editTitle}>Rename Look</h3>
                <input
                  className={styles.editInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(look)}
                  autoFocus
                  maxLength={60}
                />
                <div className={styles.editActions}>
                  <button className={styles.btnSaveEdit} onClick={() => handleEditSave(look)}>
                    Save
                  </button>
                  <button className={styles.btnCancelEdit} onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : deleteConfirm === look.id ? (
              <div key={look.id} className={styles.deleteCard}>
                <p className={styles.deleteQuestion}>Delete &quot;{look.name}&quot;?</p>
                <div className={styles.editActions}>
                  <button className={styles.btnDeleteConfirm} onClick={() => handleDelete(look.id)}>
                    Yes, Delete
                  </button>
                  <button className={styles.btnCancelEdit} onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <LookCard
                key={look.id}
                look={look}
                onDelete={(id) => setDeleteConfirm(id)}
                onEdit={(l) => { setEditingId(l.id); setEditName(l.name) }}
              />
            )
          ))}
        </div>
      </div>
    </main>
  )
}
