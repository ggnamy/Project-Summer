import { configureStore } from '@reduxjs/toolkit'
import analysisReducer from '../features/analysis/analysisSlice'
import tryonReducer from '../features/tryon/tryonSlice'
import quizReducer from '../features/quiz/quizSlice'
import languageReducer from './languageSlice'

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    tryon: tryonReducer,
    quiz: quizReducer,
    language: languageReducer,
  },
})
