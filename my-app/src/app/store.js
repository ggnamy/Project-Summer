import { configureStore } from '@reduxjs/toolkit'
import analysisReducer from '../features/analysis/analysisSlice'
import tryonReducer from '../features/tryon/tryonSlice'

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    tryon: tryonReducer,
  },
})
