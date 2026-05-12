import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { callClaudeAnalysis } from './analysisAPI'

export const analyzePhotoWithTM = createAsyncThunk(
  'analysis/analyzePhotoWithTM',
  async ({ base64Image, mediaType, label, probability, allPredictions, scores }, { rejectWithValue }) => {
    try {
      const colorResult = await callClaudeAnalysis(base64Image, mediaType)
      return {
        ...colorResult,
        label,
        probability,
        allPredictions,
        scores,
        scoringMode: 'tm',
        makeupReason: null,
      }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    photo: null,
    undertone: null,
    season: null,
    scores: null,
    scoringMode: null,
    makeupReason: null,
    skinTone: null,
    recommendations: null,
    avoidColors: null,
    label: null,
    probability: null,
    allPredictions: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setPhoto(state, action) {
      state.photo = action.payload
    },
    resetAnalysis(state) {
      Object.assign(state, {
        photo: null, undertone: null, season: null, scores: null,
        scoringMode: null, makeupReason: null, skinTone: null,
        recommendations: null, avoidColors: null,
        label: null, probability: null, allPredictions: null,
        status: 'idle', error: null,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePhotoWithTM.pending, (state) => {
        state.status = 'loading'
        state.error  = null
      })
      .addCase(analyzePhotoWithTM.fulfilled, (state, action) => {
        const p = action.payload
        state.status          = 'succeeded'
        state.undertone       = p.undertone
        state.season          = p.season
        state.scores          = p.scores
        state.scoringMode     = p.scoringMode
        state.makeupReason    = p.makeupReason
        state.skinTone        = p.skinTone
        state.recommendations = p.recommendations
        state.avoidColors     = p.avoidColors
        state.label           = p.label
        state.probability     = p.probability
        state.allPredictions  = p.allPredictions
      })
      .addCase(analyzePhotoWithTM.rejected, (state, action) => {
        state.status = 'failed'
        state.error  = action.payload
      })
  },
})

export const { setPhoto, resetAnalysis } = analysisSlice.actions
export default analysisSlice.reducer
