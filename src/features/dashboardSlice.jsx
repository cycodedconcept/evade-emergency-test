import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/constant';
import axios from 'axios';


const initialState = {
    success: false,
    loading: false,
    error: null,
    dataItem: [],
    emergency: {},
    emergencyLoading: false,
    emergencyError: null,
}


export const dashboardData = createAsyncThunk(
    'dashboard/dashboardData',
    async ({token, page = 1}, {rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/responder/emergencies/dashboard?page=${page}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.setItem("dash", JSON.stringify(response.data))
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
)

export const emergencyDetails = createAsyncThunk(
    'dashboard/emergencyDetails',
    async({token, id}, {rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/responder/emergencies/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            return response.data
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
)

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
        .addCase(emergencyDetails.pending, (state) => {
            state.emergencyLoading = true;
            state.emergencyError = null;
            state.emergency = {};
        })
        .addCase(emergencyDetails.fulfilled, (state, action) => {
            state.emergencyLoading = false;
            state.emergency = action.payload
        })
        .addCase(emergencyDetails.rejected, (state, action) => {
            state.emergencyLoading = false;
            state.emergencyError = action.payload;
        })
    }
});

export default dashboardSlice.reducer;
