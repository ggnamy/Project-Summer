import { useSelector } from 'react-redux'
import { translations } from '../translations'

export function useTranslation() {
  const currentLang = useSelector((s) => s.language.currentLang)
  const dict = translations[currentLang] ?? translations.EN

  function t(key, vars) {
    let str = dict[key] ?? translations.EN[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }

  return { t, currentLang }
}
