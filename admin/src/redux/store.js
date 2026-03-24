import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import grievanceReducer from './slices/grievanceSlice';
import contractorReducer from './slices/contractorSlice';
import studentReducer from './slices/studentSlice';
import locationReducer from './slices/locationSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer,
    contractors: contractorReducer,
    students: studentReducer,
    locations: locationReducer,
  },
});

export default store;
