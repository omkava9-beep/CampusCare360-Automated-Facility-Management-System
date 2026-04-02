import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/studentSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, token } = useSelector(s => s.student);

    const handleLogout = (locationId) => {
        dispatch(logout());
        // Clear QR session for this specific location if provided
        if (locationId) {
            localStorage.removeItem(`student_session_${locationId}`);
        }
        navigate('/login');
    };

    return { user, isAuthenticated, isLoading, token, logout: handleLogout };
};
