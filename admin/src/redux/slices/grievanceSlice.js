import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getApiUrl = () => import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const API_URL = `${getApiUrl()}/api/v1/user`;

export const fetchGrievances = createAsyncThunk(
    'grievances/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/admin/grievances?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPendingApprovals = createAsyncThunk(
    'grievances/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/grievances/approval/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStats = createAsyncThunk(
    'grievances/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.stats;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const approveGrievance = createAsyncThunk(
    'grievances/approve',
    async ({ grievanceId, adminFeedback }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/grievances/approve/${grievanceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminFeedback })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return { grievanceId, ...data.grievance };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const rejectGrievance = createAsyncThunk(
    'grievances/reject',
    async ({ grievanceId, adminFeedback }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/grievances/reject/${grievanceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminFeedback })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return { grievanceId, ...data.grievance };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const grievanceSlice = createSlice({
    name: 'grievances',
    initialState: {
        list: [],
        stats: null,
        pagination: {},
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGrievances.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGrievances.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload.grievances;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchGrievances.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchPendingApprovals.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
                state.isLoading = false;
                // Replace list with pending approvals (unabridged)
                state.list = action.payload.grievances;
            })
            .addCase(fetchPendingApprovals.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(approveGrievance.fulfilled, (state, action) => {
                const index = state.list.findIndex(g => g._id === action.payload.grievanceId);
                if (index !== -1) state.list[index].status = 'resolved';
            })
            .addCase(rejectGrievance.fulfilled, (state, action) => {
                const index = state.list.findIndex(g => g._id === action.payload.grievanceId);
                if (index !== -1) state.list[index].status = 'in-progress';
            });
    }
});

export default grievanceSlice.reducer;