import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/constant';
import axios from 'axios';

const initialState = {
    success: false,
    loading: false,
    error: null,
    message: {}
}

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ formData }, {rejectWithValue}) => {
        try {
           const response = await axios.post(`${API_URL}/ads_apis/api/login`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
           });
           localStorage.setItem('item', JSON.stringify(response.data));
           return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

const loginSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
    }
});

export default loginSlice.reducer;