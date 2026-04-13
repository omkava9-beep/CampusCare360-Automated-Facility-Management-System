import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  HardHat,
  GraduationCap,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/PPSUNAACA+Logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar whenever route changes (mobile nav)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navItems = [
    { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'  },
    { path: '/approvals',   icon: CheckCircle,      label: 'Approvals'  },
    { path: '/grievances',  icon: MessageSquare,    label: 'Grievances' },
    { path: '/locations',   icon: MapPin,            label: 'Locations'  },
    { path: '/contractors', icon: HardHat,           label: 'Contractors'},
    { path: '/students',    icon: GraduationCap,     label: 'Students'   },
    { path: '/settings',    icon: Settings,          label: 'Settings'   },
  ];

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="sidebar-logo">
          <img src={logo} alt="CampusCare Logo" />
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Backdrop overlay ── */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="CampusCare Logo" />
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
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
    </>
  );
};

export default Sidebar;
