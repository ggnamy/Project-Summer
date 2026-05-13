import { useSelector } from 'react-redux'
import en from '../locales/en.json'
import th from '../locales/th.json'

const locales = { EN: en, TH: th }

export function useTranslation() {
  const currentLang = useSelector((s) => s.language.currentLang)
  const dict = locales[currentLang] ?? en

  function t(key, vars) {
    let str = dict[key] ?? en[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }

  return { t, currentLang }
}
