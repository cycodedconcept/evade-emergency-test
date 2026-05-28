import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config/constant';

const initialState = {
  success: false,
  loading: false,
  error: null,
  closeEmergencyItem: {},
  emergencySearchResults: {},
};

const buildAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const closeEmergencyCase = createAsyncThunk(
  'create/closeEmergencyCase',
  async ({ token, id, payload = {} }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/responder/emergencies/${id}/close`,
        payload,
        {
          headers: buildAuthHeaders(token),
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

export const searchEmergencyCasesByStatus = createAsyncThunk(
  'create/searchEmergencyCasesByStatus',
  async ({ token, status = 'closed', page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/responder/emergencies/dashboard`, {
        params: { status, page },
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

const emergencyCreateSlice = createSlice({
  name: 'create',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(closeEmergencyCase.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(closeEmergencyCase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.closeEmergencyItem = action.payload;
      })
      .addCase(closeEmergencyCase.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(searchEmergencyCasesByStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(searchEmergencyCasesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.emergencySearchResults = action.payload;
      })
      .addCase(searchEmergencyCasesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default emergencyCreateSlice.reducer;
