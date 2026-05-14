import { configureStore } from '@reduxjs/toolkit'
import analysisReducer from '../features/analysis/analysisSlice'
import tryonReducer from '../features/tryon/tryonSlice'
import quizReducer from '../features/quiz/quizSlice'

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    tryon: tryonReducer,
    quiz: quizReducer,
  },
})
