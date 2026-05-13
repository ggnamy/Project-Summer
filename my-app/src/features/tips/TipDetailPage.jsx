import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTipById, editTip, removeTip, clearCurrent } from './tipsSlice'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './TipDetailPage.module.css'

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']

const SEASON_COLORS = {
  Spring: { bg: '#FFF8F0', color: '#C45C00', border: '#FFB74D' },
  Summer: { bg: '#F3EEFF', color: '#5C35A0', border: '#9575CD' },
  Autumn: { bg: '#FFF2EE', color: '#A0300A', border: '#FF8A65' },
  Winter: { bg: '#EEF5FF', color: '#0D47A1', border: '#64B5F6' },
}

function getMyTipIds() {
  try { return JSON.parse(localStorage.getItem('myTipIds') || '[]') } catch { return [] }
}
function removeMyTipId(id) {
  localStorage.setItem('myTipIds', JSON.stringify(getMyTipIds().filter(i => i !== String(id))))
}

export default function TipDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current, detailStatus } = useSelector(s => s.tips)
  const { t } = useTranslation()

  const owned = getMyTipIds().includes(String(id))

  const [editing, setEditing]         = useState(false)
  const [editTitle, setEditTitle]     = useState('')
  const [editSeason, setEditSeason]   = useState('')
  const [editBody, setEditBody]       = useState('')
  const [editErrors, setEditErrors]   = useState({})
  const [saveStatus, setSaveStatus]   = useState('idle')

  useEffect(() => {
    dispatch(loadTipById(id))
    return () => { dispatch(clearCurrent()) }
  }, [id, dispatch])

  useEffect(() => {
    if (current) {
      setEditTitle(current.title || '')
      setEditSeason(current.season || '')
      setEditBody(current.body || '')
    }
  }, [current])

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t('tips_detail_confirm_delete'))) return
    try {
      await dispatch(removeTip(id)).unwrap()
      removeMyTipId(id)
      navigate('/tips')
    } catch { /* ignore */ }
  }, [id, dispatch, navigate, t])

  const handleSave = useCallback(async (e) => {
    e.preventDefault()
    const errs = {}
    if (!editTitle.trim())  errs.title  = 'tips_form_err_title'
    if (!editSeason)        errs.season = 'tips_form_err_season'
    if (!editBody.trim())   errs.body   = 'tips_form_err_body'
    if (Object.keys(errs).length) { setEditErrors(errs); return }
    setEditErrors({})
    setSaveStatus('loading')
    try {
      await dispatch(editTip({ id, data: { title: editTitle.trim(), season: editSeason, body: editBody.trim() } })).unwrap()
      setEditing(false)
      setSaveStatus('idle')
    } catch {
      setSaveStatus('error')
    }
  }, [id, editTitle, editSeason, editBody, dispatch])

  if (detailStatus === 'loading') return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.loadingWrap}><span className={styles.spinner} /></div>
      </div>
    </main>
  )

  if (detailStatus === 'failed' || (detailStatus === 'succeeded' && !current)) return (
    <main className={styles.main}>
      <div className="container">
        <Link to="/tips" className={styles.backLink}>{t('tips_detail_back')}</Link>
        <p className={styles.notFound}>{t('tips_not_found')}</p>
      </div>
    </main>
  )

  if (!current) return null

  const sc = SEASON_COLORS[current.season] || {}

  return (
    <main className={styles.main}>
      <div className="container">

        <Link to="/tips" className={styles.backLink}>{t('tips_detail_back')}</Link>

        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span
              className={styles.seasonBadge}
              style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
            >
              {t(`season_${current.season?.toLowerCase()}`)}
            </span>
            {owned && <span className={styles.ownedBadge}>{t('tips_your_tip')}</span>}
          </div>

          {!editing ? (
            <>
              <h1 className={styles.tipTitle}>{current.title}</h1>
              <p className={styles.tipBody}>{current.body}</p>
              {owned && (
                <div className={styles.actions}>
                  <button className={styles.btnEdit} onClick={() => setEditing(true)}>
                    {t('tips_detail_edit')}
                  </button>
                  <button className={styles.btnDelete} onClick={handleDelete}>
                    {t('tips_detail_delete')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave} noValidate className={styles.editForm}>
              <h2 className={styles.editHeading}>{t('tips_edit_title_h')}</h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('tips_form_title_label')}</label>
                <input
                  className={[styles.input, editErrors.title ? styles.inputError : ''].join(' ')}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  maxLength={80}
                />
                {editErrors.title && <span className={styles.fieldErr}>{t(editErrors.title)}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('tips_form_season_label')}</label>
                <select
                  className={[styles.select, editErrors.season ? styles.inputError : ''].join(' ')}
                  value={editSeason}
                  onChange={e => setEditSeason(e.target.value)}
                >
                  <option value="">{t('tips_form_season_default')}</option>
                  {SEASONS.map(s => (
                    <option key={s} value={s}>{t(`season_${s.toLowerCase()}`)}</option>
                  ))}
                </select>
                {editErrors.season && <span className={styles.fieldErr}>{t(editErrors.season)}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('tips_form_body_label')}</label>
                <textarea
                  className={[styles.textarea, editErrors.body ? styles.inputError : ''].join(' ')}
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                {editErrors.body && <span className={styles.fieldErr}>{t(editErrors.body)}</span>}
              </div>

              {saveStatus === 'error' && <p className={styles.submitErr}>{t('tips_load_error')}</p>}

              <div className={styles.editActions}>
                <button type="submit" className={styles.btnSave} disabled={saveStatus === 'loading'}>
                  {saveStatus === 'loading' ? t('tips_edit_saving') : t('tips_edit_save')}
                </button>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => { setEditing(false); setEditErrors({}) }}
                >
                  {t('tips_edit_cancel')}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </main>
  )
}
