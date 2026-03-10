import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:4000/api/v1/user';

export const fetchLocations = createAsyncThunk(
    'locations/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/locations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.locations;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createLocation = createAsyncThunk(
    'locations/create',
    async (locationData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/createlocation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(locationData)
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const locationSlice = createSlice({
    name: 'locations',
    initialState: {
        list: [],
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createLocation.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            });
    }
});

export default locationSlice.reducer;
