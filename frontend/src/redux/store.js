import authReducer from './slices/authSlice';
import contractorReducer from './slices/contractorSlice';
import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    contractor: contractorReducer
  },
});

export default store;
