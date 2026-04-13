import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/user`;

export const fetchContractors = createAsyncThunk(
    'contractors/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/users/contractor`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.users;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createContractor = createAsyncThunk(
    'contractors/create',
    async (contractorData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/createuser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...contractorData, role: 'contractor' })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchContractorDetailedStats = createAsyncThunk(
    'contractors/fetchStats',
    async (userId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/users/contractor/${userId}/stats`, {
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

export const updateContractorStatus = createAsyncThunk(
    'contractors/updateStatus',
    async ({ userId, newState }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/stateupdate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, newState })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return { userId, newState };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const contractorSlice = createSlice({
    name: 'contractors',
    initialState: {
        list: [],
        selectedContractorDetails: null,
        isLoading: false,
        isStatsLoading: false,
        error: null
    },
    reducers: {
        clearSelectedContractor: (state) => {
            state.selectedContractorDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchContractors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchContractors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createContractor.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateContractorStatus.fulfilled, (state, action) => {
                const contractor = state.list.find(c => c._id === action.payload.userId);
                if (contractor) contractor.status = action.payload.newState;
            })
            .addCase(fetchContractorDetailedStats.pending, (state) => {
                state.isStatsLoading = true;
                state.selectedContractorDetails = null;
            })
            .addCase(fetchContractorDetailedStats.fulfilled, (state, action) => {
                state.isStatsLoading = false;
                state.selectedContractorDetails = action.payload;
            })
            .addCase(fetchContractorDetailedStats.rejected, (state, action) => {
                state.isStatsLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSelectedContractor } = contractorSlice.actions;
export default contractorSlice.reducer;
