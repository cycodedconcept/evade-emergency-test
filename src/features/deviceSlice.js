import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config/constant';

const initialState = {
  success: false,
  loading: false,
  error: null,
  detailsItem: [],
};

export const getDetails = createAsyncThunk(
  'device/getDetails',
  async ({ token, device_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get_device_details`, {
        params: { device_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

export const closeDevice = createAsyncThunk(
  'device/closeDevice',
  async ({ token, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/close_case`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDetails.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.detailsItem = action.payload;
      })
      .addCase(getDetails.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(closeDevice.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(closeDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.detailsItem = action.payload;
      })
      .addCase(closeDevice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default deviceSlice.reducer;
