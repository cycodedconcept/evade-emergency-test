## API Reference

**Base URL:** `https://zubitechnologies.com/ads_apis/api`

### Key endpoints used in this project

| Endpoint | Method | Description | authorization
|----------|--------|-------------|--------------|
| `/responder/analysis/dashboard` | GET | for analysis | bearer token

### Auth
- token is gotten from localstorage `item`

### rules
- add another slice called analysis.jsx inside the features folder
- follow this structure in creating the slice
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

- add the thunk to the store
- import it into the Reports.jsx file and populate the data there.

this is the sample response, use it on that page
{
    "message": "Analysis dashboard retrieved successfully",
    "user_type": "responder_company",
    "filters": {
        "year": 2026,
        "status": "all",
        "trend_days": 7
    },
    "crash_trends": {
        "title": "Crash Trends",
        "subtitle": "Number of crashes per day over the last 7 days.",
        "labels": [
            "Day 1",
            "Day 2",
            "Day 3",
            "Day 4",
            "Day 5",
            "Day 6",
            "Day 7"
        ],
        "series": {
            "total_crashes": [
                0,
                0,
                0,
                0,
                7,
                0,
                0
            ],
            "fatal": [
                0,
                0,
                0,
                0,
                7,
                0,
                0
            ],
            "non_fatal": [
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ]
        },
        "rows": [
            {
                "date": "2026-05-15",
                "day_label": "Fri",
                "display_label": "Day 1",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-16",
                "day_label": "Sat",
                "display_label": "Day 2",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-17",
                "day_label": "Sun",
                "display_label": "Day 3",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-18",
                "day_label": "Mon",
                "display_label": "Day 4",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-19",
                "day_label": "Tue",
                "display_label": "Day 5",
                "total_crashes": 7,
                "fatal": 7,
                "non_fatal": 0,
                "collisions": 7,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-20",
                "day_label": "Wed",
                "display_label": "Day 6",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "date": "2026-05-21",
                "day_label": "Thu",
                "display_label": "Day 7",
                "total_crashes": 0,
                "fatal": 0,
                "non_fatal": 0,
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            }
        ]
    },
    "severity_distribution": {
        "title": "Statistic",
        "subtitle": "Crash severity distribution",
        "total": 7,
        "fatal": {
            "count": 7,
            "percentage": 100
        },
        "non_fatal": {
            "count": 0,
            "percentage": 0
        },
        "unknown": {
            "count": 0,
            "percentage": 0
        },
        "chart": [
            {
                "label": "Fatal",
                "value": 7,
                "percentage": 100
            },
            {
                "label": "Non-Fatal",
                "value": 0,
                "percentage": 0
            }
        ]
    },
    "emergency_type_statistics": {
        "title": "Statistic",
        "subtitle": "Emergency types over the year.",
        "year": 2026,
        "summary": {
            "collisions": {
                "label": "Collisions",
                "value": 7,
                "change": {
                    "percentage": 100,
                    "direction": "up",
                    "text": "100% ↑"
                }
            },
            "somersaults": {
                "label": "Somersaults",
                "value": 0,
                "change": {
                    "percentage": 0,
                    "direction": "none",
                    "text": "0%"
                }
            },
            "submersions": {
                "label": "Submersions",
                "value": 0,
                "change": {
                    "percentage": 0,
                    "direction": "none",
                    "text": "0%"
                }
            },
            "sos_alerts": {
                "label": "SOS Alerts",
                "value": 0,
                "change": {
                    "percentage": 0,
                    "direction": "none",
                    "text": "0%"
                }
            }
        },
        "labels": [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],
        "datasets": [
            {
                "key": "collisions",
                "label": "Collisions",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    7,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            },
            {
                "key": "somersaults",
                "label": "Somersaults",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            },
            {
                "key": "submersions",
                "label": "Submersions",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            },
            {
                "key": "sos_alerts",
                "label": "SOS Alerts",
                "data": [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            }
        ],
        "rows": [
            {
                "month_number": 1,
                "month": "Jan",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 2,
                "month": "Feb",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 3,
                "month": "Mar",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 4,
                "month": "Apr",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 5,
                "month": "May",
                "collisions": 7,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 6,
                "month": "Jun",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 7,
                "month": "Jul",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 8,
                "month": "Aug",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 9,
                "month": "Sep",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 10,
                "month": "Oct",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 11,
                "month": "Nov",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            },
            {
                "month_number": 12,
                "month": "Dec",
                "collisions": 0,
                "somersaults": 0,
                "submersions": 0,
                "sos_alerts": 0
            }
        ]
    }
}

- reference the Card.jsx file and see how the thunk is called