import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setLanguage } from '../../app/languageSlice'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './LanguageSwitcher.module.css'

const LANGUAGES = [
  { code: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'TH', flag: '🇹🇭', name: 'ภาษาไทย' },
  { code: 'ZH', flag: '🇨🇳', name: '中文' },
  { code: 'JA', flag: '🇯🇵', name: '日本語' },
  { code: 'KO', flag: '🇰🇷', name: '한국어' },
]

export default function LanguageSwitcher() {
  const dispatch = useDispatch()
  const { currentLang } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0]

  return (
    <div className={styles.switcher} ref={ref}>
      <button
        className={styles.btn}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current.flag}</span>
        <span className={styles.btnCode}>{current.code}</span>
        <span className={[styles.chevron, open ? styles.chevronOpen : ''].join(' ')}>▾</span>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === currentLang}
              className={[
                styles.option,
                lang.code === currentLang ? styles.optionActive : '',
              ].join(' ')}
              onClick={() => { dispatch(setLanguage(lang.code)); setOpen(false) }}
            >
              <span className={styles.optionFlag}>{lang.flag}</span>
              <span className={styles.optionName}>{lang.name}</span>
              <span className={styles.optionCode}>{lang.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
