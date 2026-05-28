import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config/constant';

const initialState = {
  success: false,
  loading: false,
  error: null,
  dataItem: {},
};

const buildAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const analysisDashboardData = createAsyncThunk(
  'analysis/analysisDashboardData',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/responder/analysis/dashboard`, {
        headers: buildAuthHeaders(token),
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(analysisDashboardData.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(analysisDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.dataItem = action.payload;
      })
      .addCase(analysisDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default analysisSlice.reducer;
