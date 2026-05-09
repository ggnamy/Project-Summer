import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  extractFeatures,
  trainClassifier,
  predictBeautyScore,
  hasSavedModel,
  deleteSavedClassifier,
} from './beautyModel'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const addTrainingExample = createAsyncThunk(
  'scoring/addTrainingExample',
  async ({ dataUrl, label }, { rejectWithValue }) => {
    try {
      const features = await extractFeatures(dataUrl)
      return { id: `${Date.now()}-${Math.random()}`, label, preview: dataUrl, features }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const trainModel = createAsyncThunk(
  'scoring/trainModel',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { examples } = getState().scoring
      return await trainClassifier(examples, (progress) => {
        dispatch(setTrainingProgress(progress))
      })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const predictBeauty = createAsyncThunk(
  'scoring/predictBeauty',
  async (dataUrl, { rejectWithValue }) => {
    try {
      return await predictBeautyScore(dataUrl)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const checkSavedModel = createAsyncThunk(
  'scoring/checkSavedModel',
  async () => hasSavedModel()
)

export const resetModel = createAsyncThunk(
  'scoring/resetModel',
  async (_, { rejectWithValue }) => {
    try {
      await deleteSavedClassifier()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const scoringSlice = createSlice({
  name: 'scoring',
  initialState: {
    examples: [],         // { id, label (0|1), preview, features }
    modelStatus: 'none',  // none | extracting | training | ready | error
    trainingProgress: { epoch: 0, total: 40, accuracy: 0 },
    finalAccuracy: null,
    modelExists: false,
    beautyScore: null,
    error: null,
  },
  reducers: {
    removeExample(state, action) {
      state.examples = state.examples.filter(e => e.id !== action.payload)
    },
    setTrainingProgress(state, action) {
      state.trainingProgress = action.payload
    },
    clearBeautyScore(state) {
      state.beautyScore = null
    },
  },
  extraReducers: (builder) => {
    builder
      // addTrainingExample
      .addCase(addTrainingExample.pending, (state) => {
        if (state.modelStatus !== 'training') state.modelStatus = 'extracting'
      })
      .addCase(addTrainingExample.fulfilled, (state, action) => {
        state.examples.push(action.payload)
        if (state.modelStatus === 'extracting') state.modelStatus = 'none'
      })
      .addCase(addTrainingExample.rejected, (state, action) => {
        state.error = action.payload
        state.modelStatus = 'none'
      })

      // trainModel
      .addCase(trainModel.pending, (state) => {
        state.modelStatus = 'training'
        state.error = null
      })
      .addCase(trainModel.fulfilled, (state, action) => {
        state.modelStatus = 'ready'
        state.finalAccuracy = action.payload.accuracy
        state.modelExists = true
      })
      .addCase(trainModel.rejected, (state, action) => {
        state.modelStatus = 'error'
        state.error = action.payload
      })

      // predictBeauty
      .addCase(predictBeauty.fulfilled, (state, action) => {
        state.beautyScore = action.payload
      })

      // checkSavedModel
      .addCase(checkSavedModel.fulfilled, (state, action) => {
        state.modelExists = action.payload
        if (action.payload) state.modelStatus = 'ready'
      })

      // resetModel
      .addCase(resetModel.fulfilled, (state) => {
        state.examples = []
        state.modelStatus = 'none'
        state.finalAccuracy = null
        state.modelExists = false
        state.beautyScore = null
        state.trainingProgress = { epoch: 0, total: 40, accuracy: 0 }
      })
  },
})

export const { removeExample, setTrainingProgress, clearBeautyScore } = scoringSlice.actions
export default scoringSlice.reducer
