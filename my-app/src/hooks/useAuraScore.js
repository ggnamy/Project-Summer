import { useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import { SEASON_PALETTES, COLOR_CATEGORIES } from '../data/seasons'

const selectAnalysis = (state) => state.analysis
const selectTryon    = (state) => state.tryon

export const selectAuraScore = createSelector(
  [selectAnalysis, selectTryon],
  (analysis, tryon) => {
    const base = analysis.scores?.excellent ?? 0
    if (base === 0) return 0

    const season   = analysis.season
    const palette  = season ? SEASON_PALETTES[season] : null
    const selected = tryon.selectedColors

    if (!palette || Object.keys(selected).length === 0) return Math.round(base)

    let bonus = 0
    COLOR_CATEGORIES.forEach(({ key }) => {
      const chosenHex = selected[key]
      if (!chosenHex) return
      const inPalette = palette[key]?.some(c => c.hex.toLowerCase() === chosenHex.toLowerCase())
      if (inPalette) bonus += 3
    })

    return Math.min(100, Math.round(base + bonus))
  }
)

export default function useAuraScore() {
  return useSelector(selectAuraScore)
}
