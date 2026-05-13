import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { loadTips, addTip, removeTip } from './tipsSlice'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './TipsPage.module.css'

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
function addMyTipId(id) {
  const ids = getMyTipIds()
  if (!ids.includes(String(id))) ids.push(String(id))
  localStorage.setItem('myTipIds', JSON.stringify(ids))
}
function removeMyTipId(id) {
  localStorage.setItem('myTipIds', JSON.stringify(getMyTipIds().filter(i => i !== String(id))))
}

export default function TipsPage() {
  const dispatch = useDispatch()
  const { list, listStatus } = useSelector(s => s.tips)
  const { t } = useTranslation()

  const [filter, setFilter]       = useState('all')
  const [myIds, setMyIds]         = useState(getMyTipIds)

  const [title, setTitle]         = useState('')
  const [season, setSeason]       = useState('')
  const [body, setBody]           = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitStatus, setSubmitStatus] = useState('idle')

  useEffect(() => { dispatch(loadTips()) }, [dispatch])

  const validate = useCallback(() => {
    const errs = {}
    if (!title.trim())  errs.title  = 'tips_form_err_title'
    if (!season)        errs.season = 'tips_form_err_season'
    if (!body.trim())   errs.body   = 'tips_form_err_body'
    return errs
  }, [title, season, body])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setFormErrors({})
    setSubmitStatus('loading')
    try {
      const result = await dispatch(addTip({ title: title.trim(), season, body: body.trim() })).unwrap()
      addMyTipId(result.id)
      setMyIds(getMyTipIds())
      setTitle(''); setSeason(''); setBody('')
      setSubmitStatus('idle')
    } catch {
      setSubmitStatus('error')
    }
  }, [validate, title, season, body, dispatch])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(t('tips_detail_confirm_delete'))) return
    try {
      await dispatch(removeTip(id)).unwrap()
      removeMyTipId(id)
      setMyIds(getMyTipIds())
    } catch { /* ignore */ }
  }, [dispatch, t])

  const filtered = filter === 'all' ? list : list.filter(tip => tip.season === filter)

  return (
    <main className={styles.main}>
      <div className="container">

        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>{t('tips_badge')}</span>
          <h1 className={styles.title}>{t('tips_title')}</h1>
          <p className={styles.subtitle}>{t('tips_subtitle')}</p>
        </div>

        {/* ── Share a Tip form ── */}
        <div className={styles.formCard}>
          <h2 className={styles.formHeading}>{t('tips_form_title_h')}</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('tips_form_title_label')}</label>
                <input
                  className={[styles.input, formErrors.title ? styles.inputError : ''].join(' ')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('tips_form_title_ph')}
                  maxLength={80}
                />
                {formErrors.title && <span className={styles.fieldErr}>{t(formErrors.title)}</span>}
              </div>
              <div className={styles.fieldGroupNarrow}>
                <label className={styles.label}>{t('tips_form_season_label')}</label>
                <select
                  className={[styles.select, formErrors.season ? styles.inputError : ''].join(' ')}
                  value={season}
                  onChange={e => setSeason(e.target.value)}
                >
                  <option value="">{t('tips_form_season_default')}</option>
                  {SEASONS.map(s => (
                    <option key={s} value={s}>{t(`season_${s.toLowerCase()}`)}</option>
                  ))}
                </select>
                {formErrors.season && <span className={styles.fieldErr}>{t(formErrors.season)}</span>}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t('tips_form_body_label')}</label>
              <textarea
                className={[styles.textarea, formErrors.body ? styles.inputError : ''].join(' ')}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={t('tips_form_body_ph')}
                rows={3}
                maxLength={500}
              />
              {formErrors.body && <span className={styles.fieldErr}>{t(formErrors.body)}</span>}
            </div>
            {submitStatus === 'error' && <p className={styles.submitErr}>{t('tips_load_error')}</p>}
            <button className={styles.btnSubmit} type="submit" disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? t('tips_form_posting') : t('tips_form_submit')}
            </button>
          </form>
        </div>

        {/* ── Season filter ── */}
        <div className={styles.filterRow}>
          <button
            className={[styles.filterBtn, filter === 'all' ? styles.filterActive : ''].join(' ')}
            onClick={() => setFilter('all')}
          >
            {t('tips_filter_all')}
          </button>
          {SEASONS.map(s => (
            <button
              key={s}
              className={[styles.filterBtn, filter === s ? styles.filterActive : ''].join(' ')}
              onClick={() => setFilter(s)}
            >
              {t(`season_${s.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* ── Tips list ── */}
        {listStatus === 'loading' && (
          <div className={styles.loadingRow}>
            <span className={styles.spinner} />
          </div>
        )}
        {listStatus === 'failed' && (
          <div className={styles.errorBox}>{t('tips_load_error')}</div>
        )}
        {listStatus === 'succeeded' && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💬</span>
            <p>{filter === 'all' ? t('tips_empty') : t('tips_empty_filtered')}</p>
          </div>
        )}
        {listStatus === 'succeeded' && filtered.length > 0 && (
          <div className={styles.grid}>
            {filtered.map(tip => {
              const owned = myIds.includes(String(tip.id))
              const sc    = SEASON_COLORS[tip.season] || {}
              return (
                <div key={tip.id} className={styles.tipCard}>
                  <div className={styles.tipCardTop}>
                    <span
                      className={styles.seasonBadge}
                      style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
                    >
                      {t(`season_${tip.season?.toLowerCase()}`)}
                    </span>
                    {owned && <span className={styles.ownedBadge}>{t('tips_your_tip')}</span>}
                  </div>
                  <h3 className={styles.tipTitle}>{tip.title}</h3>
                  <p className={styles.tipBody}>{tip.body}</p>
                  <div className={styles.tipCardFooter}>
                    <Link to={`/tips/${tip.id}`} className={styles.readMore}>{t('tips_read_more')}</Link>
                    {owned && (
                      <button className={styles.btnDelete} onClick={() => handleDelete(tip.id)}>
                        {t('tips_detail_delete')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
