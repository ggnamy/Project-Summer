import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchTips, fetchTipById, createTip, updateTip, deleteTip } from './tipsAPI'

export const loadTips    = createAsyncThunk('tips/loadAll', fetchTips)
export const loadTipById = createAsyncThunk('tips/loadOne', fetchTipById)
export const addTip      = createAsyncThunk('tips/add',    createTip)
export const editTip     = createAsyncThunk('tips/edit',   ({ id, data }) => updateTip(id, data))
export const removeTip   = createAsyncThunk('tips/remove', deleteTip)

const tipsSlice = createSlice({
  name: 'tips',
  initialState: {
    list: [],
    current: null,
    listStatus: 'idle',
    detailStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrent: (s) => { s.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTips.pending,      (s)    => { s.listStatus = 'loading' })
      .addCase(loadTips.fulfilled,    (s, a) => { s.listStatus = 'succeeded'; s.list = a.payload })
      .addCase(loadTips.rejected,     (s, a) => { s.listStatus = 'failed';    s.error = a.error.message })
      .addCase(loadTipById.pending,   (s)    => { s.detailStatus = 'loading' })
      .addCase(loadTipById.fulfilled, (s, a) => { s.detailStatus = 'succeeded'; s.current = a.payload })
      .addCase(loadTipById.rejected,  (s, a) => { s.detailStatus = 'failed';    s.error = a.error.message })
      .addCase(addTip.fulfilled,      (s, a) => { s.list.unshift(a.payload) })
      .addCase(editTip.fulfilled,     (s, a) => {
        const idx = s.list.findIndex(t => String(t.id) === String(a.payload.id))
        if (idx !== -1) s.list[idx] = a.payload
        s.current = a.payload
      })
      .addCase(removeTip.fulfilled,   (s, a) => {
        s.list = s.list.filter(t => String(t.id) !== String(a.meta.arg))
      })
  },
})

export const { clearCurrent } = tipsSlice.actions
export default tipsSlice.reducer
