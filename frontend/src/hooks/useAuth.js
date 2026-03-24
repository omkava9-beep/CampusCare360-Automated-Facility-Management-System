import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const login = (email, password) => {
    return dispatch(loginUser({ email, password }));
  };

  const logout = () => {
    return dispatch(logoutUser());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError: handleClearError,
  };
};
