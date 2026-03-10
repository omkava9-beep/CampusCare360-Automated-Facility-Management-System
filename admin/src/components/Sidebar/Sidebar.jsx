import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  HardHat, 
  GraduationCap, 
  Settings, 
  LogOut,
  ChevronRight,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.svg';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/approvals', icon: CheckCircle, label: 'Approvals' },
    { path: '/grievances', icon: MessageSquare, label: 'Grievances' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/contractors', icon: HardHat, label: 'Contractors' },
    { path: '/students', icon: GraduationCap, label: 'Students' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="CampusCare Logo" />
          <span className="brand-name">CampusCare</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            <ChevronRight size={16} className="chevron" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <LogOut size={20} className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
