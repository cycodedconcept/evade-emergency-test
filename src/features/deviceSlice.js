import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../config/constant";
import axios from "axios";

const initialState = {
    success: false,
    loading: false,
    error: null,
    devices: [],
    detailsItem: []
}

export const getDevices = createAsyncThunk(
    'device/getDevices',
    async({token, page = 1}, {rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/ads_apis/api/get_devices?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            localStorage.setItem("dev", JSON.stringify(response.data.devices.data));
            return response.data
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

export const addDevice = createAsyncThunk(
    'device/addDevice',
    async({token, formData}, {rejectWithValue}) => {
        try {
            const response = await axios.post(`${API_URL}/ads_apis/api/createdevices`, formData, {
                headers: {
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
    }
);

export const updateDevice = createAsyncThunk(
    'device/updateDevice',
    async ({token, formData}, {rejectWithValue}) => {
        try {
            const response = await axios.post(`${API_URL}/ads_apis/api/updatedevices`, formData, {
                headers: {
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
    }
);

export const getDetails = createAsyncThunk(
    'device/getDetails',
    async ({token, device_id}, {rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/ads_apis/api/get_device_details`, {
                params: {
                    device_id: device_id
                },
                headers: {
                    Authorization: `Bearer ${token}`,
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
);

export const closeDevice = createAsyncThunk(
    'device/closeDevice',
    async ({token, formData}, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/ads_apis/api/close_case`, formData, {
                headers: {
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
    }
)

const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getDevices.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(getDevices.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.devices = action.payload
        })
        .addCase(getDevices.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
        .addCase(addDevice.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(addDevice.fulfilled, (state, action) => {
            state.loading = false;
            state.success = action.payload;
        })
        .addCase(addDevice.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
        .addCase(updateDevice.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(updateDevice.fulfilled, (state, action) => {
            state.loading = false;
            state.success = action.payload;
        })
        .addCase(updateDevice.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
        .addCase(getDetails.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(getDetails.fulfilled, (state, action) => {
            state.loading = false;
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
            state.success = action.payload;
        })
        .addCase(closeDevice.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
    }
});

export default deviceSlice.reducer