import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = ({ locationId }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const currentLocation = useSelector(s => s.student.currentLocation);

    return (
        <header className="student-navbar">
            <div className="snav-brand" onClick={() => navigate('/')}>
                <div className="snav-logo-box">C</div>
                <span className="snav-brand-name">CampusCare</span>
            </div>

            {currentLocation && (
                <div className="snav-location-badge">
                    <MapPin size={12} />
                    <span>{currentLocation.buildingBlock} · {currentLocation.locationName}</span>
                </div>
            )}

            <div className="snav-actions">
                <div
                    className="snav-avatar"
                    onClick={() => navigate('/profile')}
                    title={user?.fName}
                >
                    {user?.profilePic
                        ? <img src={user.profilePic} alt="avatar" />
                        : <User size={18} />
                    }
                </div>
            </div>
        </header>
    );
};

export default Navbar;
