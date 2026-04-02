import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyGrievances } from '../../redux/slices/studentSlice';
import { ClipboardList, Search, MapPin, Calendar, ChevronRight, Filter } from 'lucide-react';
import './Grievances.css';

const STATUS_TABS = [
    { key: 'all',         label: 'All' },
    { key: 'applied',     label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done',        label: 'Under Review' },
    { key: 'resolved',    label: 'Resolved' },
];

const STATUS_CONFIG = {
    applied:       { label: 'Pending',      cls: 'status-applied' },
    'in-progress': { label: 'In Progress',  cls: 'status-in-progress' },
    done:          { label: 'Under Review', cls: 'status-done' },
    resolved:      { label: 'Resolved',     cls: 'status-resolved' },
};

const CATEGORIES = ['All', 'Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'IT & Network', 'Security', 'Civil', 'Other'];
const PRIORITIES  = ['All', 'Low', 'Medium', 'High'];

const priorityColor = (p) => {
    if (p === 'High')   return '#f85149';
    if (p === 'Medium') return '#e3b341';
    return '#3fb950';
};

const GrievanceList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { grievances, isLoading } = useSelector(s => s.student);

    const [activeTab,   setActiveTab]   = useState('all');
    const [search,      setSearch]      = useState('');
    const [catFilter,   setCatFilter]   = useState('All');
    const [priFilter,   setPriFilter]   = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        dispatch(fetchMyGrievances({}));
    }, [dispatch]);

    const filtered = grievances.filter(g => {
        const matchSearch = (g.subject  || '').toLowerCase().includes(search.toLowerCase()) ||
                            (g.ticketID || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = activeTab === 'all' || g.status   === activeTab;
        const matchCat    = catFilter === 'All' || g.category === catFilter;
        const matchPri    = priFilter === 'All' || g.priority === priFilter;
        return matchSearch && matchStatus && matchCat && matchPri;
    });

    const hasActiveFilter = search || catFilter !== 'All' || priFilter !== 'All';

    return (
        <div className="tickets-page page-enter">
            <div className="tickets-container">

                {/* ── Header ── */}
                <div className="tickets-header">
                    <div>
                        <h1>My Tickets</h1>
                        <p>
                            {isLoading ? '—' : filtered.length}&nbsp;
                            report{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="tickets-header-right">
                        <div className="tickets-search">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="ID or keyword…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <button
                            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(p => !p)}
                            aria-label="Toggle filters"
                        >
                            <Filter size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Filters panel ── */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Category</label>
                            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Priority</label>
                            <select value={priFilter} onChange={e => setPriFilter(e.target.value)}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Status Tabs ── */}
                <div className="tickets-tabs">
                    {STATUS_TABS.map(t => (
                        <button
                            key={t.key}
                            className={`tk-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── List ── */}
                {isLoading ? (
                    <div className="tickets-loading">
                        {[1, 2, 3, 4].map(i => <div key={i} className="tk-skeleton" />)}
                    </div>

                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <ClipboardList size={44} style={{ opacity: 0.15 }} />
                        <h3>{hasActiveFilter ? 'No matching tickets' : 'No tickets yet'}</h3>
                        <p>
                            {hasActiveFilter
                                ? 'Try adjusting your filters'
                                : 'Scan a campus QR code to report your first issue'}
                        </p>
                    </div>

                ) : (
                    <div className="tickets-list">
                        {filtered.map(g => {
                            const sc = STATUS_CONFIG[g.status] || { label: g.status, cls: 'status-applied' };
                            return (
                                <div
                                    key={g._id}
                                    className="ticket-card"
                                    onClick={() => navigate(`/tickets/${g._id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${g._id}`)}
                                >
                                    {/* Priority colour bar */}
                                    <div
                                        className="tc-bar"
                                        style={{ background: priorityColor(g.priority) }}
                                    />

                                    {/* Body */}
                                    <div className="tc-body">
                                        <div className="tc-top">
                                            <span className="tc-id">{g.ticketID}</span>
                                            <div className="tc-badges">
                                                <span className={`status-badge ${sc.cls}`}>{sc.label}</span>
                                                <span className={`priority-badge priority-${g.priority?.toLowerCase() || 'normal'}`}>
                                                    {g.priority || 'Normal'}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="tc-subject">{g.subject}</h3>

                                        <div className="tc-meta">
                                            {g.location && (
                                                <span>
                                                    <MapPin size={10} />
                                                    {g.location.building} · {g.location.name}
                                                </span>
                                            )}
                                            <span>
                                                <Calendar size={10} />
                                                {new Date(g.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                                {' · '}
                                                {new Date(g.createdAt).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                            {g.category && (
                                                <span className="tc-category">{g.category}</span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight size={15} className="tc-chevron" />
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

export default GrievanceList;