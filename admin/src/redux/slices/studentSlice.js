import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/user`;

export const fetchStudents = createAsyncThunk(
    'students/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/users/student`, {
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

export const updateStudentStatus = createAsyncThunk(
    'students/updateStatus',
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

export const registerStudent = createAsyncThunk(
    'students/register',
    async (studentData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/createuser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...studentData, role: 'student' })
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message);
            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const studentSlice = createSlice({
    name: 'students',
    initialState: {
        list: [],
        isLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateStudentStatus.fulfilled, (state, action) => {
                const student = state.list.find(s => s._id === action.payload.userId);
                if (student) student.status = action.payload.newState;
            })
            .addCase(registerStudent.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            });
    }
});

export default studentSlice.reducer;
