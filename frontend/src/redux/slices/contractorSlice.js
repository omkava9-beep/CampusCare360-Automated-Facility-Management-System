import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/user/contractor`;

const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('contractorToken')}`,
    'Content-Type': 'application/json'
});

export const fetchStats = createAsyncThunk(
    'contractor/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/stats`, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.stats;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGrievances = createAsyncThunk(
    'contractor/fetchGrievances',
    async (status, { rejectWithValue }) => {
        try {
            const url = status ? `${API_URL}/grievances?status=${status}` : `${API_URL}/grievances`;
            const response = await fetch(url, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.grievances;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGrievanceDetail = createAsyncThunk(
    'contractor/fetchGrievanceDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/grievances/${id}`, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.grievance;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const toggleAvailability = createAsyncThunk(
    'contractor/toggleAvailability',
    async (status, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/availability`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const acceptGrievance = createAsyncThunk(
    'contractor/acceptGrievance',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/grievances/${id}/accept`, {
                method: 'PUT',
                headers: getAuthHeader()
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.grievance;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const rejectGrievance = createAsyncThunk(
    'contractor/rejectGrievance',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/grievances/${id}/reject`, {
                method: 'PUT',
                headers: getAuthHeader()
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateGrievanceStatus = createAsyncThunk(
    'contractor/updateStatus',
    async ({ id, status, notes, resolvedPhoto }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/grievances/${id}/status`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status, notes, resolvedPhoto })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.grievance;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContractorProfile = createAsyncThunk(
    'contractor/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchContractorProfile = createAsyncThunk(
    'contractor/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/profile`, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchNotifications = createAsyncThunk(
    'contractor/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('contractorToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'contractor/markNotificationAsRead',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('contractorToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const clearAllNotifications = createAsyncThunk(
    'contractor/clearAllNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('contractorToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    stats: null,
    grievances: [],
    currentGrievance: null,
    profile: null,
    profileStats: null,
    priorityBreakdown: null,
    criticalityBreakdown: null,
    monthlyTrend: [],
    recentTasks: [],
    isLoading: false,
    notifications: [],
    unreadNotifications: 0,
    error: null,
};

const contractorSlice = createSlice({
    name: 'contractor',
    initialState,
    reducers: {
        clearCurrentGrievance: (state) => {
            state.currentGrievance = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStats.pending, (state) => { state.isLoading = true; })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchGrievances.fulfilled, (state, action) => {
                state.grievances = action.payload;
            })
            .addCase(fetchGrievanceDetail.fulfilled, (state, action) => {
                state.currentGrievance = action.payload;
            })
            .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
                const index = state.grievances.findIndex(g => g._id === action.payload._id);
                if (index !== -1) state.grievances[index].status = action.payload.status;
                if (state.currentGrievance?._id === action.payload._id) {
                    state.currentGrievance.status = action.payload.status;
                }
            })
            .addCase(acceptGrievance.fulfilled, (state, action) => {
                const index = state.grievances.findIndex(g => g._id === action.payload._id);
                if (index !== -1) state.grievances[index].status = 'in-progress';
                if (state.currentGrievance?._id === action.payload._id) {
                    state.currentGrievance.status = 'in-progress';
                }
            })
            .addCase(rejectGrievance.fulfilled, (state, action) => {
                state.grievances = state.grievances.filter(g => g._id !== action.meta.arg);
                if (state.currentGrievance?._id === action.meta.arg) {
                    state.currentGrievance = null;
                }
            })
            .addCase(updateContractorProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) state.profile = action.payload;
            })
            .addCase(updateContractorProfile.pending, (state) => { state.isLoading = true; })
            .addCase(updateContractorProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchContractorProfile.fulfilled, (state, action) => {
                state.profile = action.payload.profile;
                state.profileStats = action.payload.stats;
                state.priorityBreakdown = action.payload.priorityBreakdown;
                state.criticalityBreakdown = action.payload.criticalityBreakdown;
                state.monthlyTrend = action.payload.monthlyTrend;
                state.recentTasks = action.payload.recentTasks;
            })
            // Notifications
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload.notifications;
                state.unreadNotifications = action.payload.unreadCount;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const id = action.payload;
                const notification = state.notifications.find(n => n._id === id);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
                }
            })
            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.notifications = [];
                state.unreadNotifications = 0;
            });
    }
});

export const { clearCurrentGrievance } = contractorSlice.actions;
export default contractorSlice.reducer;
