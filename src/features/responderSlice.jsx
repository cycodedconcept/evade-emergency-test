import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config/constant';

const initialState = {
  success: false,
  loading: false,
  error: null,
  createResponderUserItem: {},
  responderAgents: {},
  responderAgentDetails: {},
  updatedResponderAgent: {},
  responderAgentLoginItem: {},
  responderProfile: {},
  responderAnalysisDashboard: {},
  responderAgentsRequestId: null,
};

const buildAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const createResponderUser = createAsyncThunk(
  'responder/createResponderUser',
  async ({ token, name, email, phone, address, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/responder/users/create`,
        { name, email, phone, address, password },
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

export const getResponderAgents = createAsyncThunk(
  'responder/getResponderAgents',
  async ({ token, search = '', page = 1 }, { rejectWithValue, signal }) => {
    try {
      const response = await axios.get(`${API_URL}/responder/agents`, {
        params: { search, page },
        signal,
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

export const getResponderAgentDetails = createAsyncThunk(
  'responder/getResponderAgentDetails',
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/responder/agents/${id}`, {
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

export const updateResponderAgent = createAsyncThunk(
  'responder/updateResponderAgent',
  async ({ token, id, name, email, phone, address, password, lat, log, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/responder/agents/${id}`,
        { name, email, phone, address, password, lat, log, status },
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

export const responderAgentLogin = createAsyncThunk(
  'responder/responderAgentLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/responder/agent/login`, {
        email,
        password,
      });

      if (response.data?.token) {
        localStorage.setItem('item', response.data.token);
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

export const getResponderProfile = createAsyncThunk(
  'responder/getResponderProfile',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/responder/profile`, {
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

export const getResponderAnalysisDashboard = createAsyncThunk(
  'responder/getResponderAnalysisDashboard',
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

const responderSlice = createSlice({
  name: 'responder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createResponderUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createResponderUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createResponderUserItem = action.payload;
      })
      .addCase(createResponderUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getResponderAgents.pending, (state, action) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.responderAgentsRequestId = action.meta.requestId;
      })
      .addCase(getResponderAgents.fulfilled, (state, action) => {
        if (state.responderAgentsRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.success = true;
        state.responderAgents = action.payload;
        state.responderAgentsRequestId = null;
      })
      .addCase(getResponderAgents.rejected, (state, action) => {
        if (state.responderAgentsRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.success = false;
        state.error = action.meta.aborted ? null : action.payload;
        state.responderAgentsRequestId = null;
      })
      .addCase(getResponderAgentDetails.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getResponderAgentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.responderAgentDetails = action.payload;
      })
      .addCase(getResponderAgentDetails.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(updateResponderAgent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateResponderAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedResponderAgent = action.payload;
      })
      .addCase(updateResponderAgent.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(responderAgentLogin.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(responderAgentLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.responderAgentLoginItem = action.payload;
      })
      .addCase(responderAgentLogin.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getResponderProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getResponderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.responderProfile = action.payload;
      })
      .addCase(getResponderProfile.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getResponderAnalysisDashboard.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getResponderAnalysisDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.responderAnalysisDashboard = action.payload;
      })
      .addCase(getResponderAnalysisDashboard.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default responderSlice.reducer;
