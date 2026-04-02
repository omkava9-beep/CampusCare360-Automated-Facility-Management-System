import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMyGrievances, fetchLocation } from '../../redux/slices/studentSlice';
import {
    ClipboardList, CheckCircle2, Clock,
    AlertCircle, ChevronRight, MapPin,
    Calendar, Sparkles, PlusCircle
} from 'lucide-react';
import './Home.css';

const STATUS_CONFIG = {
    applied:       { label: 'Pending',      cls: 'status-applied' },
    'in-progress': { label: 'In Progress',  cls: 'status-in-progress' },
    done:          { label: 'Under Review', cls: 'status-done' },
    resolved:      { label: 'Resolved',     cls: 'status-resolved' },
};

const LEGEND = [
    { label: 'Pending',      dot: '#638fff', key: 'pending' },
    { label: 'In Progress',  dot: '#fbbf24', key: 'inProgress' },
    { label: 'Resolved',     dot: '#34d399', key: 'resolved' },
];

const Home = () => {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('qr');

    const { user, grievances, isLoading, currentLocation } = useSelector(s => s.student);

    useEffect(() => {
        dispatch(fetchMyGrievances({}));
        if (locationId) dispatch(fetchLocation(locationId));
    }, [dispatch, locationId]);

    const stats = {
        total:      grievances.length,
        pending:    grievances.filter(g => g.status === 'applied').length,
        inProgress: grievances.filter(g => g.status === 'in-progress').length,
        resolved:   grievances.filter(g => g.status === 'resolved' || g.status === 'done').length,
    };

    const recent = grievances.slice(0, 6);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const STAT_CARDS = [
        { label: 'Pending',     value: stats.pending,    icon: AlertCircle,  color: '#fbbf24' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock,        color: '#a78bfa' },
        { label: 'Resolved',    value: stats.resolved,   icon: CheckCircle2, color: '#34d399' },
    ];

    return (
        <div className="home-page page-enter">

            {/* Ambient bg */}
            <div className="home-orb-1" aria-hidden />
            <div className="home-orb-2" aria-hidden />

            <div className="home-inner">

                {/* ── HERO ── */}
                <section className="home-hero">
                    <div className="hero-left">
                        <div className="hero-badge">
                            <Sparkles size={10} />
                            Student Portal
                        </div>

                        <h1 className="hero-title">
                            {getGreeting()},<br />
                            <span className="hero-name">
                                {user?.fName || 'Student'}
                            </span>
                        </h1>

                        {currentLocation ? (
                            <div className="hero-location">
                                <MapPin size={12} />
                                {currentLocation.buildingBlock} · {currentLocation.locationName}
                            </div>
                        ) : (
                            <p className="hero-sub">
                                Scan a campus QR code to report or track issues at any location.
                            </p>
                        )}
                    </div>

                    {/* Big total counter */}
                    <div className="hero-right">
                        <span className="hero-total-label">Total reports</span>
                        <span className="hero-total-value">
                            {isLoading ? '—' : String(stats.total).padStart(2, '0')}
                        </span>
                        <span className="hero-total-sub">submitted by you</span>
                    </div>
                </section>

                {/* ── STATS STRIP ── */}
                <section className="home-stats" aria-label="Summary statistics">
                    {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="home-stat-card">
                            <div
                                className="hsc-icon"
                                style={{ background: `${color}18`, color }}
                                aria-hidden
                            >
                                <Icon size={20} strokeWidth={1.8} />
                            </div>
                            <div className="hsc-info">
                                <span className="hsc-value" style={{ color }}>
                                    {isLoading ? '—' : value}
                                </span>
                                <span className="hsc-label">{label}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ── BODY: tickets + sidebar ── */}
                <div className="home-body">

                    {/* Recent tickets */}
                    <section className="home-recent" aria-label="Recent tickets">
                        <div className="section-header">
                            <span className="section-title">Recent Tickets</span>
                            <button
                                className="section-link"
                                onClick={() => navigate('/tickets')}
                            >
                                View all <ChevronRight size={12} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="home-loading">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="home-skeleton" />
                                ))}
                            </div>
                        ) : recent.length === 0 ? (
                            <div className="empty-state">
                                <ClipboardList size={40} style={{ opacity: 0.15 }} />
                                <h3>No tickets yet</h3>
                                <p>Scan a campus QR code to report your first issue</p>
                            </div>
                        ) : (
                            <div className="home-ticket-list">
                                {recent.map(g => {
                                    const sc = STATUS_CONFIG[g.status] || {
                                        label: g.status,
                                        cls: 'status-applied',
                                    };
                                    return (
                                        <div
                                            key={g._id}
                                            className="home-ticket"
                                            onClick={() => navigate(`/tickets/${g._id}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${g._id}`)}
                                        >
                                            <div className="ht-left">
                                                <span className={`status-badge ${sc.cls}`}>
                                                    {sc.label}
                                                </span>
                                                <h3 className="ht-subject">{g.subject}</h3>
                                                <div className="ht-meta">
                                                    {g.location?.name && (
                                                        <span>
                                                            <MapPin size={10} />
                                                            {g.location.name}
                                                        </span>
                                                    )}
                                                    <span>
                                                        <Calendar size={10} />
                                                        {new Date(g.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="ht-arrow" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Sidebar */}
                    <aside className="home-sidebar">

                        {/* Quick action */}
                        <div>
                            <p className="sidebar-section-title">Quick Action</p>
                            <button
                                className="quick-action-btn"
                                onClick={() => navigate('/submit')}
                            >
                                <PlusCircle size={17} strokeWidth={2.5} />
                                Report New Issue
                            </button>
                        </div>

                        {/* Status breakdown */}
                        <div>
                            <p className="sidebar-section-title">Status Breakdown</p>
                            <div className="status-legend">
                                {LEGEND.map(({ label, dot, key }) => (
                                    <div key={key} className="legend-row">
                                        <div className="legend-left">
                                            <div
                                                className="legend-dot"
                                                style={{ background: dot }}
                                            />
                                            {label}
                                        </div>
                                        <span className="legend-count">
                                            {isLoading ? '—' : stats[key]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info tip */}
                        <div className="sidebar-info-card">
                            <strong>How it works</strong>
                            Scan any campus QR code to report an issue at that location.
                            The nearest contractor is automatically assigned based on proximity.
                        </div>

                    </aside>
                </div>

            </div>
        </div>
    );
};

export default Home;