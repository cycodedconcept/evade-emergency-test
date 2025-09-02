import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/constant';
import axios from 'axios';


const initialState = {
    success: false,
    loading: false,
    error: null,
    message: {},
    dataItem: [],
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
           localStorage.setItem('item', JSON.stringify(response.data.message[0].token));
           return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Network error' });
        }
    }
);

export const dashboardData = createAsyncThunk(
    'user/dashboardData',
    async ({token}, {rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/ads_apis/api/dashboard_api`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.setItem("dash", JSON.stringify(response.data.records))
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
)

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
        .addCase(dashboardData.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(dashboardData.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.dataItem = action.payload
        })
        .addCase(dashboardData.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
    }
});

export default loginSlice.reducer;