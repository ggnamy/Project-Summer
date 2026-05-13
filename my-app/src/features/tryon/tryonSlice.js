import { createSlice } from '@reduxjs/toolkit'

const tryonSlice = createSlice({
  name: 'tryon',
  initialState: {
    selectedColors: {},
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
    },
  },
})

export const { setColor, resetColors } = tryonSlice.actions
export default tryonSlice.reducer
