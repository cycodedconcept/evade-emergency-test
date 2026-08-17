import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/constant';
import axios from 'axios';


const initialState = {
    success: false,
    loading: false,
    error: null,
    dataItem: [],
    liveDataItem: {},
    liveLoading: false,
    liveError: null,
    emergency: {},
    emergencyLoading: false,
    emergencyError: null,
    dashboardRequestId: null,
    liveDashboardRequestId: null,
}

const fetchDashboardPayload = async ({ token, page = 1, signal }, rejectWithValue) => {
    try {
        const response = await axios.get(`${API_URL}/responder/emergencies/dashboard?page=${page}`, {
            signal,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message || "Something went wrong");
    }
};

export const dashboardData = createAsyncThunk(
    'dashboard/dashboardData',
    async ({token, page = 1}, {rejectWithValue, signal}) => {
        return fetchDashboardPayload({ token, page, signal }, rejectWithValue);
    }
)

export const dashboardLiveData = createAsyncThunk(
    'dashboard/dashboardLiveData',
    async ({token}, {rejectWithValue, signal}) => {
        return fetchDashboardPayload({ token, page: 1, signal }, rejectWithValue);
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
        .addCase(dashboardData.pending, (state, action) => {
            state.loading = true;
            state.success = false;
            state.error = null;
            state.dashboardRequestId = action.meta.requestId;
        })
        .addCase(dashboardData.fulfilled, (state, action) => {
            if (state.dashboardRequestId !== action.meta.requestId) {
                return;
            }

            state.loading = false;
            state.success = true;
            state.dataItem = action.payload
            state.dashboardRequestId = null;
        })
        .addCase(dashboardData.rejected, (state, action) => {
            if (state.dashboardRequestId !== action.meta.requestId) {
                return;
            }

            state.loading = false;
            state.success = false;
            state.error = action.meta.aborted ? null : action.payload;
            state.dashboardRequestId = null;
        })
        .addCase(dashboardLiveData.pending, (state, action) => {
            state.liveLoading = true;
            state.liveError = null;
            state.liveDashboardRequestId = action.meta.requestId;
        })
        .addCase(dashboardLiveData.fulfilled, (state, action) => {
            if (state.liveDashboardRequestId !== action.meta.requestId) {
                return;
            }

            state.liveLoading = false;
            state.liveDataItem = action.payload;
            state.liveDashboardRequestId = null;
        })
        .addCase(dashboardLiveData.rejected, (state, action) => {
            if (state.liveDashboardRequestId !== action.meta.requestId) {
                return;
            }

            state.liveLoading = false;
            state.liveError = action.meta.aborted ? null : action.payload;
            state.liveDashboardRequestId = null;
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
