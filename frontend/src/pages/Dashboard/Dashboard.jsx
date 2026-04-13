import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../hooks/useTheme';
import { toggleAvailability, fetchStats, fetchGrievances, fetchNotifications, markNotificationAsRead, clearAllNotifications } from '../../redux/slices/contractorSlice';
import {
  LayoutDashboard, ClipboardList, CheckCircle2, Clock,
  AlertCircle, User, LogOut, Bell, Search, ChevronRight,
  Power, MapPin, Moon, Sun, Wallet, TrendingUp, Activity,
  Sparkles, BarChart3, Zap, ArrowRight, Award, Check,
  Menu, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/PPSUNAACA+Logo.png';
import './Dashboard.css';

/* ── Custom chart tooltip matching admin style ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ padding: '12px 16px', background: 'rgba(13,17,34,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{label}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ margin: '3px 0', color: e.color, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
            {e.name}: <strong>{e.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#388bfd', '#e3b341', '#3fb950', '#f85149'];

/* ─────────────────────────────────────────────
   DASHBOARD HOME — rendered when no child route
   ───────────────────────────────────────────── */
const DashboardHome = ({ stats, grievances, isLoading, navigate, user }) => {
  const allGrievances = grievances || [];
  const completed = allGrievances.filter(g => g.status === 'done' || g.status === 'resolved').length;

  /* Weekly task bar data (mock using stats totals – replace with real API later) */
  const weeklyData = [
    { day: 'Mon', Tasks: 2, Completed: 1 },
    { day: 'Tue', Tasks: 4, Completed: 3 },
    { day: 'Wed', Tasks: 1, Completed: 1 },
    { day: 'Thu', Tasks: 3, Completed: 2 },
    { day: 'Fri', Tasks: 5, Completed: 4 },
    { day: 'Sat', Tasks: 2, Completed: 2 },
    { day: 'Sun', Tasks: 0, Completed: 0 },
  ];

  const pieData = [
    { name: 'Assigned',    value: stats?.applied    || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Done',        value: stats?.done       || 0 },
    { name: 'Resolved',    value: stats?.resolved   || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="db-home">
      {/* ── Ambient orbs ── */}
      <div className="db-orb db-orb-1" />
      <div className="db-orb db-orb-2" />

      {/* ── Hero header ── */}
      <header className="db-hero">
        <div className="db-hero-left">
          <div className="db-greeting-badge">
            <Sparkles size={13} /> Contractor Terminal
          </div>
          <h1 className="db-hero-title">
            Welcome back, <span className="db-name">{user?.fName || 'Technician'}</span>
          </h1>
          <p className="db-hero-subtitle">
            You have <strong style={{ color: '#e3b341' }}>{stats?.applied || 0}</strong> pending task{stats?.applied !== 1 ? 's' : ''} awaiting your attention.
          </p>
        </div>
      </header>

      {/* ── KPI stat cards ── */}
      <section className="db-stats-grid">
        {[
          { label: 'Assigned',    value: stats?.applied    ?? '—', icon: <ClipboardList size={18} />, color: '#388bfd', trend: 'Awaiting your action' },
          { label: 'In Progress', value: stats?.inProgress ?? '—', icon: <Clock size={18} />,         color: '#e3b341', trend: 'Actively being worked on' },
          { label: 'Done',        value: stats?.done       ?? '—', icon: <CheckCircle2 size={18} />,  color: '#3fb950', trend: 'Pending admin approval' },
          { label: 'Total',       value: stats?.total      ?? '—', icon: <Activity size={18} />,      color: '#a371f7', trend: `${stats?.percentageComplete || 0}% completion rate` },
        ].map((c, i) => (
          <div key={i} className={`db-stat-card glass-panel ${i === 0 ? 'highlight' : ''}`}>
            <div className="db-stat-header">
              <span className="db-stat-label">{c.label}</span>
              <span style={{ color: c.color }}>{c.icon}</span>
            </div>
            <span className="db-stat-value" style={i > 0 ? { color: c.color } : {}}>
              {isLoading && !stats ? '…' : c.value}
            </span>
            <div className="db-stat-trend" style={{ color: c.color }}>
              <TrendingUp size={12} /> {c.trend}
            </div>
          </div>
        ))}
      </section>

      {/* ── Charts row ── */}
      <div className="db-charts-row">
        {/* Weekly Activity Bar */}
        <div className="db-panel glass-panel" style={{ flex: 2 }}>
          <div className="db-panel-header">
            <h3 className="db-panel-title"><BarChart3 size={16} color="#388bfd" /> Weekly Activity</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <div className="db-chart-wrap">
              <ResponsiveContainer>
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8b949e' }} />
                  <Bar dataKey="Tasks"     fill="rgba(56,139,253,0.3)"  radius={[4,4,0,0]} barSize={16} />
                  <Bar dataKey="Completed" fill="#388bfd"               radius={[4,4,0,0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Donut */}
        <div className="db-panel glass-panel" style={{ flex: 1, minWidth: 0 }}>
          <div className="db-panel-header">
            <h3 className="db-panel-title"><Zap size={16} color="#388bfd" /> Task Status</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <div className="db-chart-wrap">
              {pieData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="42%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={6} dataKey="value" stroke="none"
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#8b949e', paddingTop: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty-chart">
                  <Activity size={36} />
                  <p>No task data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: Recent Tasks + Quick Actions ── */}
      <div className="db-bottom-row">
        {/* Recent Tasks */}
        <div className="db-panel glass-panel" style={{ flex: 2 }}>
          <div className="db-panel-header">
            <h3 className="db-panel-title"><ClipboardList size={16} color="#388bfd" /> Recent Tasks</h3>
            <button className="db-view-all" onClick={() => navigate('/grievances')}>
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="db-task-list">
            {allGrievances.length > 0 ? allGrievances.slice(0, 6).map((g, i) => (
              <div key={i} className="db-task-row" onClick={() => navigate(`/grievances/${g._id}`)}>
                <div
                  className="db-task-bar"
                  style={{ background: g.priority === 'High' ? '#f85149' : g.priority === 'Medium' ? '#e3b341' : '#3fb950' }}
                />
                <div className="db-task-info">
                  <span className="db-task-id">{g.ticketID}</span>
                  <p className="db-task-subject">{g.subject}</p>
                </div>
                <div className="db-task-chips">
                  <span className="db-chip" style={{
                    background: g.status === 'in-progress' ? 'rgba(227,179,65,0.12)' : g.status === 'done' ? 'rgba(63,185,80,0.12)' : 'rgba(56,139,253,0.12)',
                    color: g.status === 'in-progress' ? '#e3b341' : g.status === 'done' ? '#3fb950' : '#58a6ff'
                  }}>
                    {g.status === 'in-progress' ? 'In Progress' : g.status === 'done' ? 'Done' : 'Assigned'}
                  </span>
                  <span className="db-task-loc"><MapPin size={11} /> {g.location?.locationName || g.location || '—'}</span>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            )) : (
              <div className="db-empty-list">
                <ClipboardList size={40} />
                <p>No tasks assigned yet.</p>
                <span>New tasks will appear here when assigned.</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Perf Summary */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Quick Actions */}
          <div className="db-panel glass-panel">
            <h3 className="db-panel-title" style={{ marginBottom: 20 }}><Zap size={16} color="#388bfd" /> Quick Actions</h3>
            <div className="db-quick-actions">
              {[
                { label: 'My Tasks',    icon: <ClipboardList size={18} />, to: '/grievances',color: '#388bfd' },
                { label: 'Task History', icon: <Clock size={18} />,         to: '/history',   color: '#e3b341' },
                { label: 'My Profile',  icon: <User size={18} />,          to: '/profile',   color: '#3fb950' },
              ].map((a, i) => (
                <button key={i} className="db-qa-btn" style={{ '--qa-color': a.color }} onClick={() => navigate(a.to)}>
                  <span className="db-qa-icon" style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</span>
                  <span className="db-qa-label">{a.label}</span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>

          {/* Performance Card */}
          <div className="db-panel glass-panel db-perf-card">
            <h3 className="db-panel-title" style={{ marginBottom: 16 }}><Award size={16} color="#a371f7" /> Performance</h3>
            <div className="db-perf-ring-wrap">
              <svg viewBox="0 0 100 100" className="db-perf-ring">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#388bfd" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2.51 * (stats?.percentageComplete || 0)} 251`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="54" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="var(--font-heading)">{stats?.percentageComplete || 0}%</text>
              </svg>
            </div>
            <p className="db-perf-label">Completion Rate</p>
            <div className="db-perf-stats">
              <span><strong style={{ color: '#3fb950' }}>{(stats?.done || 0) + (stats?.resolved || 0)}</strong> Done</span>
              <span><strong style={{ color: '#e3b341' }}>{stats?.inProgress || 0}</strong> Active</span>
              <span><strong style={{ color: '#388bfd' }}>{stats?.applied || 0}</strong> New</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN SHELL — sidebar + outlet
   ───────────────────────────────────────────── */
const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { stats, grievances, isLoading, notifications, unreadNotifications } = useSelector(state => state.contractor);
    const location = useLocation();
    const [isAvailable, setIsAvailable] = useState(user?.status === 'Active');
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleMarkAsRead = (id) => {
        dispatch(markNotificationAsRead(id));
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            dispatch(clearAllNotifications());
        }
    };

    useEffect(() => {
        dispatch(fetchStats());
        dispatch(fetchGrievances('applied'));
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (socket) {
            socket.on('newGrievance', (data) => {
                setNotification(`🔔 New Task: ${data.subject}`);
                dispatch(fetchStats());
                dispatch(fetchGrievances('applied'));
                dispatch(fetchNotifications()); // Also refresh notifications list
                setTimeout(() => setNotification(null), 5000);
            });
            socket.on('grievanceApproved', (data) => {
                setNotification(`🎉 Great job! Task ${data.ticketID} was approved by the admin.`);
                dispatch(fetchStats());
                dispatch(fetchGrievances('applied'));
                dispatch(fetchNotifications()); // Also refresh notifications list
                setTimeout(() => setNotification(null), 8000);
            });
            socket.on('workRejected', (data) => {
                setNotification(`⚠️ Task ${data.ticketID} needs revision: ${data.feedback}`);
                dispatch(fetchStats());
                dispatch(fetchGrievances('in-progress'));
                dispatch(fetchNotifications());
                setTimeout(() => setNotification(null), 8000);
            });
            return () => {
                socket.off('newGrievance');
                socket.off('grievanceApproved');
                socket.off('workRejected');
            };
        }
    }, [socket, dispatch]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const handleToggleAvailability = () => {
        const newStatus = isAvailable ? 'Inactive' : 'Active';
        dispatch(toggleAvailability(newStatus));
        setIsAvailable(!isAvailable);
    };

    return (
        <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* ── Notification toast ── */}
            {notification && (
                <div className="notif-toast">
                    <Bell size={14} /> {notification}
                </div>
            )}

            {/* ── Sidebar Overlay (for mobile) ── */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="db-logo-img db-logo-full" />
                        <div className="db-logo-short">C</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} className="nav-icon" />
                        <span className="nav-label">Dashboard</span>
                        <ChevronRight size={16} className="chevron" />
                    </NavLink>
                    <NavLink to="/grievances" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <ClipboardList size={20} className="nav-icon" />
                        <span className="nav-label">My Tasks</span>
                        {stats?.applied > 0 && <span className="nav-badge">{stats.applied}</span>}
                        <ChevronRight size={16} className="chevron" />
                    </NavLink>
                    <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Clock size={20} className="nav-icon" />
                        <span className="nav-label">Task History</span>
                        <ChevronRight size={16} className="chevron" />
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <User size={20} className="nav-icon" />
                        <span className="nav-label">My Profile</span>
                        <ChevronRight size={16} className="chevron" />
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="availability-panel">
                        <div className="availability-info">
                            <span className={`status-dot ${isAvailable ? 'active' : 'inactive'}`} />
                            <span className="status-text">{isAvailable ? 'Online' : 'Offline'}</span>
                        </div>
                        <button onClick={handleToggleAvailability} className={`toggle-switch ${isAvailable ? 'on' : 'off'}`}>
                            <Power size={14} />
                        </button>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} /> <span className="logout-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="main-content">
                <header className="content-header">
                    <div className="header-left">
                        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search tasks..." />
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="theme-toggle-btn" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className="notification-wrapper" style={{ position: 'relative' }}>
                            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={18} />
                                {unreadNotifications > 0 && (
                                    <span className="notification-badge" style={{ position: 'absolute', top: -2, right: -2, background: '#f85149', color: 'white', fontSize: '10px', fontWeight: 'bold', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </span>
                                )}
                            </button>

                            {/* NOTIFICATION PANEL */}
                            {showNotifications && (
                                    <div className="notif-dropdown glass-panel shadow-2xl" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320, zIndex: 1000, padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                                        <div className="notif-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>Notifications</h4>
                                            {notifications.length > 0 && (
                                                <button
                                                    className="clear-all-btn"
                                                    onClick={handleClearAll}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--text-muted)',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        transition: 'color 0.2s, background 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div className="notif-list" style={{ maxHeight: 350, overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <Bell size={24} style={{ opacity: 0.3, marginBottom: 10 }} />
                                                <p style={{ margin: 0 }}>You're all caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => handleMarkAsRead(n._id)}
                                                    style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s', background: n.isRead ? 'transparent' : 'rgba(56,139,253,0.05)', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                                                    className="notif-item-hover"
                                                >
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'transparent' : '#58a6ff', marginTop: 6, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: n.isRead ? 'var(--text-secondary)' : '#fff', lineHeight: '1.4' }}>{n.message}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                            {n.type === 'assignment' && <span style={{ fontSize: '0.65rem', color: '#e3b341', border: '1px solid rgba(227,179,65,0.2)', padding: '1px 6px', borderRadius: 4 }}>New Task</span>}
                                                            {n.type === 'approval' && <span style={{ fontSize: '0.65rem', color: '#3fb950', border: '1px solid rgba(63,185,80,0.2)', padding: '1px 6px', borderRadius: 4 }}>Approved</span>}
                                                            {n.type === 'system' && <span style={{ fontSize: '0.65rem', color: '#f85149', border: '1px solid rgba(248,81,73,0.2)', padding: '1px 6px', borderRadius: 4 }}>Alert</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-profile">
                            <span className="user-name">{user?.fName || 'Contractor'}</span>
                            <div className="user-avatar" onClick={() => navigate('/profile')}>
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-body">
                    <Outlet context={{ stats, grievances, isLoading }} />
                    {/* Show Home only when at the root dashboard path */}
                    {location.pathname === '/' && (
                        <DashboardHome
                            stats={stats}
                            grievances={grievances}
                            isLoading={isLoading}
                            navigate={navigate}
                            user={user}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
