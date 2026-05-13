import en from '../locales/en.json'

export function useTranslation() {
  function t(key, vars) {
    let str = en[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }

  return { t }
}
