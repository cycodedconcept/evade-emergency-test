import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config/constant';
import axios from 'axios';


const initialState = {
    success: false,
    loading: false,
    error: null,
    message: {},
}

export const registerUser = createAsyncThunk(
    'user/register/User',
    async ({license_key, email, phone, password}, {rejectWithValue}) => {
        try {
            const response = await axios.post(`${API_URL}/responder/register`, {
                license_key,
                email,
                phone,
                password
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

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ license_key, email, password }, {rejectWithValue}) => {
        try {
           const response = await axios.post(`${API_URL}/responder/login`, {
            license_key,
            email,
            password
           }, 
        //    {
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        //    }
        );
           localStorage.setItem('item', response.data.token);
           return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Network error' });
        }
    }
);



const loginSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.success = false;
            state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.message = action.payload;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        })
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
