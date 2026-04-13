import { logoutUser } from '../slices/authSlice';

/**
 * Redux middleware that intercepts rejected actions.
 * If the error message or status code indicates an authentication failure (401),
 * it automatically clears session data and logs the user out.
 */
export const authMiddleware = (store) => (next) => (action) => {
  // Check if this is a rejected action from an async thunk
  if (action.type.endsWith('/rejected')) {
    const errorMessage = action.payload || '';
    
    // Check for common 'unauthorized' keywords or if state shows a 401 was handled
    // Note: Since 'fetch' is used manually in slices, we check the rejected payload
    const isUnauthorized = 
      typeof errorMessage === 'string' && 
      (errorMessage.toLowerCase().includes('unauthorized') || 
       errorMessage.toLowerCase().includes('token is not valid') ||
       errorMessage.toLowerCase().includes('authorization denied'));

    if (isUnauthorized) {
      console.warn('Authentication failure detected by middleware. Logging out...');
      
      // Clear storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Force a logout action to reset state
      store.dispatch(logoutUser());
      
      // Optional: Force a reload or redirect if needed, 
      // but Redux state change should trigger re-render in App.jsx
    }
  }

  return next(action);
};
