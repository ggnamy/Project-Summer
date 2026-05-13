import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'auracolor_lang'
const SUPPORTED = ['EN', 'TH']

function loadLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && SUPPORTED.includes(stored) ? stored : 'EN'
  } catch {
    return 'EN'
  }
}

const languageSlice = createSlice({
  name: 'language',
  initialState: { currentLang: loadLang() },
  reducers: {
    setLanguage(state, action) {
      if (SUPPORTED.includes(action.payload)) {
        state.currentLang = action.payload
        try { localStorage.setItem(STORAGE_KEY, action.payload) } catch {}
      }
    },
  },
})

export const { setLanguage } = languageSlice.actions
export default languageSlice.reducer
