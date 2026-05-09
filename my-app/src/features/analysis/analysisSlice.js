import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { callClaudeAnalysis } from './analysisAPI'

export const analyzePhoto = createAsyncThunk(
  'analysis/analyzePhoto',
  async ({ base64Image, mediaType }, { rejectWithValue }) => {
    try {
      return await callClaudeAnalysis(base64Image, mediaType)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const analyzePhotoWithTM = createAsyncThunk(
  'analysis/analyzePhotoWithTM',
  async ({ base64Image, mediaType, label, probability, allPredictions, auraScore }, { rejectWithValue }) => {
    try {
      const colorResult = await callClaudeAnalysis(base64Image, mediaType, { skipScoring: true })
      return {
        ...colorResult,
        label,
        probability,
        allPredictions,
        auraScore,
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
    auraScore: null,
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
    setAnalysisResult(state, action) {
      const p = action.payload
      state.undertone       = p.undertone
      state.season          = p.season
      state.auraScore       = p.auraScore
      state.scoringMode     = p.scoringMode
      state.makeupReason    = p.makeupReason
      state.skinTone        = p.skinTone
      state.recommendations = p.recommendations
      state.avoidColors     = p.avoidColors
      state.label           = p.label ?? null
      state.probability     = p.probability ?? null
      state.allPredictions  = p.allPredictions ?? null
      state.status          = 'succeeded'
    },
    setWebcamPrediction(state, action) {
      const { label, probability, allPredictions, auraScore } = action.payload
      state.label          = label
      state.probability    = probability
      state.allPredictions = allPredictions
      state.auraScore      = auraScore
      state.scoringMode    = 'tm'
      state.status         = 'succeeded'
    },
    resetAnalysis(state) {
      Object.assign(state, {
        photo: null, undertone: null, season: null, auraScore: null,
        scoringMode: null, makeupReason: null, skinTone: null,
        recommendations: null, avoidColors: null,
        label: null, probability: null, allPredictions: null,
        status: 'idle', error: null,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePhoto.pending, (state) => {
        state.status = 'loading'
        state.error  = null
      })
      .addCase(analyzePhoto.fulfilled, (state, action) => {
        const p = action.payload
        state.status          = 'succeeded'
        state.undertone       = p.undertone
        state.season          = p.season
        state.auraScore       = p.auraScore
        state.scoringMode     = p.scoringMode
        state.makeupReason    = p.makeupReason
        state.skinTone        = p.skinTone
        state.recommendations = p.recommendations
        state.avoidColors     = p.avoidColors
      })
      .addCase(analyzePhoto.rejected, (state, action) => {
        state.status = 'failed'
        state.error  = action.payload
      })
      .addCase(analyzePhotoWithTM.pending, (state) => {
        state.status = 'loading'
        state.error  = null
      })
      .addCase(analyzePhotoWithTM.fulfilled, (state, action) => {
        const p = action.payload
        state.status          = 'succeeded'
        state.undertone       = p.undertone
        state.season          = p.season
        state.auraScore       = p.auraScore
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

export const { setPhoto, setAnalysisResult, setWebcamPrediction, resetAnalysis } = analysisSlice.actions
export default analysisSlice.reducer
