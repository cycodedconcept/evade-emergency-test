import { createSelector, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config/constant';
import { createMissedCaseStatsSelector } from '../utils/missedCaseUtils';

const initialState = {
  rows: [],
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  },
  company: {},
  userType: '',
  status: 'idle',
  error: null,
};

const buildAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const getStoredToken = () => {
  const tokenItem = localStorage.getItem('item');

  if (!tokenItem) {
    return null;
  }

  try {
    return JSON.parse(tokenItem);
  } catch {
    return tokenItem;
  }
};

const getErrorMessage = (payload, fallbackMessage = 'Something went wrong') => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.error) {
    return payload.error;
  }

  return fallbackMessage;
};

export const fetchMissedCases = createAsyncThunk(
  'missedCases/fetchMissedCases',
  async ({ page = 1, perPage = 10 }, { rejectWithValue, signal }) => {
    try {
      const token = getStoredToken();

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.get(`${API_URL}/responder/missed-cases`, {
        params: {
          page,
          per_page: perPage,
        },
        signal,
        headers: buildAuthHeaders(token),
      });

      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const missedCasesSlice = createSlice({
  name: 'missedCases',
  initialState,
  reducers: {
    setPage: (state, action) => {
      const nextPage = Number(action.payload);

      if (!Number.isFinite(nextPage) || nextPage < 1) {
        return;
      }

      state.pagination.current_page = nextPage;
    },
    setPerPage: (state, action) => {
      const nextPerPage = Number(action.payload);

      if (!Number.isFinite(nextPerPage) || nextPerPage < 1) {
        return;
      }

      state.pagination.per_page = nextPerPage;
      state.pagination.current_page = 1;
    },
    // TODO: add search/filter once the API supports query params
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMissedCases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMissedCases.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rows = action.payload?.rows || [];
        state.pagination = {
          ...state.pagination,
          ...(action.payload?.pagination || {}),
        };
        state.company = action.payload?.company || {};
        state.userType = action.payload?.user_type || '';
      })
      .addCase(fetchMissedCases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.meta.aborted
          ? null
          : getErrorMessage(action.payload, action.error?.message);
      });
  },
});

export const { setPage, setPerPage } = missedCasesSlice.actions;

const selectMissedCasesState = (state) => state.missedCases;

export const selectMissedCases = createSelector(
  [selectMissedCasesState],
  (missedCasesState) => missedCasesState?.rows || []
);

export const selectMissedCasesPagination = createSelector(
  [selectMissedCasesState],
  (missedCasesState) => missedCasesState?.pagination || initialState.pagination
);

export const selectMissedCasesStatus = createSelector(
  [selectMissedCasesState],
  (missedCasesState) => missedCasesState?.status || initialState.status
);

export const selectMissedCasesError = createSelector(
  [selectMissedCasesState],
  (missedCasesState) => missedCasesState?.error || null
);

export const selectMissedCasesCompany = createSelector(
  [selectMissedCasesState],
  (missedCasesState) => missedCasesState?.company || {}
);

export const selectMissedCasesStats = createMissedCaseStatsSelector(
  selectMissedCases,
  selectMissedCasesPagination
);

export default missedCasesSlice.reducer;
