import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getLooks, createLook, apiUpdateLook, apiDeleteLook } from './tryonAPI'

export const fetchLooks = createAsyncThunk(
  'tryon/fetchLooks',
  async (_, { rejectWithValue }) => {
    try { return await getLooks() }
    catch (err) { return rejectWithValue(err.message) }
  }
)

export const saveLook = createAsyncThunk(
  'tryon/saveLook',
  async (look, { rejectWithValue }) => {
    try { return await createLook(look) }
    catch (err) { return rejectWithValue(err.message) }
  }
)

export const updateLook = createAsyncThunk(
  'tryon/updateLook',
  async ({ id, look }, { rejectWithValue }) => {
    try { return await apiUpdateLook(id, look) }
    catch (err) { return rejectWithValue(err.message) }
  }
)

export const deleteLook = createAsyncThunk(
  'tryon/deleteLook',
  async (id, { rejectWithValue }) => {
    try { return await apiDeleteLook(id) }
    catch (err) { return rejectWithValue(err.message) }
  }
)

const tryonSlice = createSlice({
  name: 'tryon',
  initialState: {
    selectedColors: {},   // { lipColors: '#hex', blushColors: '#hex', ... }
    liveScore: 0,
    savedLooks: [],
    status: 'idle',       // idle | loading | succeeded | failed
    error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchLooks.pending,   (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchLooks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.savedLooks = action.payload ?? []
      })
      .addCase(fetchLooks.rejected,  (state, action) => { state.status = 'failed'; state.error = action.payload })

      .addCase(saveLook.fulfilled,   (state, action) => { state.savedLooks.push(action.payload) })

      .addCase(updateLook.fulfilled, (state, action) => {
        const idx = state.savedLooks.findIndex(l => l.id === action.payload.id)
        if (idx !== -1) state.savedLooks[idx] = action.payload
      })

      .addCase(deleteLook.fulfilled, (state, action) => {
        state.savedLooks = state.savedLooks.filter(l => l.id !== action.payload)
      })
  },
})

export const { setColor, resetColors, setLiveScore } = tryonSlice.actions
export default tryonSlice.reducer
