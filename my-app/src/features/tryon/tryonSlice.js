import { createSlice } from '@reduxjs/toolkit'

const tryonSlice = createSlice({
  name: 'tryon',
  initialState: {
    selectedColors: {},
    liveScore: 0,
  },
  reducers: {
    setColor(state, action) {
      const { category, color } = action.payload
      if (state.selectedColors[category] === color) {
        delete state.selectedColors[category]
      } else {
        state.selectedColors[category] = color
      }
    },
    resetColors(state) {
      state.selectedColors = {}
      state.liveScore = 0
    },
    setLiveScore(state, action) {
      state.liveScore = action.payload
    },
  },
})

export const { setColor, resetColors, setLiveScore } = tryonSlice.actions
export default tryonSlice.reducer
