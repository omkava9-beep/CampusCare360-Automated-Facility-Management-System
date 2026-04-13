import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { USER_API } from '../../api';

const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('studentToken')}`,
    'Content-Type': 'application/json'
});

// ── Thunks ──────────────────────────────────────────────

export const loginStudent = createAsyncThunk('student/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.STUDENT_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        // Persist token
        localStorage.setItem('studentToken', data.token);
        localStorage.setItem('studentUser', JSON.stringify(data.user));
        return data;
    } catch (err) {
        return rejectWithValue('Network error. Please check your connection.');
    }
});

export const fetchMyGrievances = createAsyncThunk('student/fetchGrievances', async ({ status, locationId } = {}, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (locationId) params.append('locationId', locationId);
        
        const res = await fetch(USER_API.MY_GRIEVANCES(params.toString()), { headers: getAuthHeader() });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data.grievances;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const fetchGrievanceDetail = createAsyncThunk('student/fetchDetail', async (id, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.GRIEVANCE_DETAIL(id), { headers: getAuthHeader() });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data.grievance;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const submitGrievance = createAsyncThunk('student/submit', async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('subject', payload.subject);
        formData.append('description', payload.description);
        formData.append('category', payload.category);
        formData.append('priority', payload.priority);
        formData.append('qrCodeLocationId', payload.qrCodeLocationId);
        if (payload.photo) formData.append('photo', payload.photo);

        const token = localStorage.getItem('studentToken');
        const res = await fetch(USER_API.SUBMIT_GRIEVANCE, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData // Correctly constructed inside thunk
        });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const fetchStudentProfile = createAsyncThunk('student/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.STUDENT_PROFILE, { headers: getAuthHeader() });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data.profile;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const updateStudentProfile = createAsyncThunk('student/updateProfile', async (profileData, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.STUDENT_PROFILE, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(profileData)
        });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        localStorage.setItem('studentUser', JSON.stringify(data.profile));
        return data.profile;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const changePassword = createAsyncThunk('student/changePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.CHANGE_PASSWORD, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data.message;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

export const fetchLocation = createAsyncThunk('student/fetchLocation', async (locationId, { rejectWithValue }) => {
    try {
        const res = await fetch(USER_API.LOCATION(locationId));
        const data = await res.json();
        if (!res.ok) return rejectWithValue(data.message);
        return data.location;
    } catch (err) {
        return rejectWithValue('Network error.');
    }
});

// ── Initial State ────────────────────────────────────────

const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('studentUser')); } catch { return null; }
})();
const storedToken = localStorage.getItem('studentToken');

const initialState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    grievances: [],
    currentGrievance: null,
    profile: null,
    currentLocation: null,
    error: null,
    submitSuccess: null,
};

// ── Slice ────────────────────────────────────────────────

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.grievances = [];
            state.currentGrievance = null;
            state.profile = null;
            localStorage.removeItem('studentToken');
            localStorage.removeItem('studentUser');
        },
        clearError(state) { state.error = null; },
        clearSubmitSuccess(state) { state.submitSuccess = null; },
        clearCurrentGrievance(state) { state.currentGrievance = null; },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginStudent.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(loginStudent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginStudent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Grievances
            .addCase(fetchMyGrievances.pending, (state) => { state.isLoading = true; })
            .addCase(fetchMyGrievances.fulfilled, (state, action) => {
                state.isLoading = false;
                state.grievances = action.payload;
            })
            .addCase(fetchMyGrievances.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Detail
            .addCase(fetchGrievanceDetail.pending, (state) => { state.isLoading = true; })
            .addCase(fetchGrievanceDetail.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGrievance = action.payload;
            })
            .addCase(fetchGrievanceDetail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Submit
            .addCase(submitGrievance.pending, (state) => { state.isLoading = true; state.error = null; state.submitSuccess = null; })
            .addCase(submitGrievance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.submitSuccess = action.payload;
            })
            .addCase(submitGrievance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Profile
            .addCase(fetchStudentProfile.fulfilled, (state, action) => { state.profile = action.payload; })
            .addCase(updateStudentProfile.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(updateStudentProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.user = { ...state.user, ...action.payload };
            })
            .addCase(updateStudentProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(changePassword.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(changePassword.fulfilled, (state) => { state.isLoading = false; })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Location
            .addCase(fetchLocation.fulfilled, (state, action) => { state.currentLocation = action.payload; })
    }
});

export const { logout, clearError, clearSubmitSuccess, clearCurrentGrievance } = studentSlice.actions;
export default studentSlice.reducer;
