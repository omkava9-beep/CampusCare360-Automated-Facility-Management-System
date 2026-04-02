import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, User } from 'lucide-react';
import './BottomNav.css';

const tabs = [
    { to: '/',        label: 'Home',    icon: Home,          end: true },
    { to: '/submit',  label: 'Report',  icon: PlusCircle,    end: false },
    { to: '/tickets', label: 'Tickets', icon: ClipboardList,  end: false },
    { to: '/profile', label: 'Profile', icon: User,           end: false },
];

const BottomNav = () => (
    <nav className="bottom-nav">
        {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
                <Icon size={22} />
                <span>{label}</span>
            </NavLink>
        ))}
    </nav>
);

export default BottomNav;
