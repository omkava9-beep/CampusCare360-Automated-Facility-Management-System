import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievances } from '../../redux/slices/contractorSlice';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Search, MapPin, Calendar, 
  AlertTriangle, ChevronRight, Clock
} from 'lucide-react';
import './Grievances.css';

const PRIORITY_COLORS = { High: '#f85149', Medium: '#e3b341', Low: '#3fb950' };
const STATUS_CLASSES  = { applied: 'badge badge-applied', 'in-progress': 'badge badge-in-progress', done: 'badge badge-done', resolved: 'badge badge-resolved', history: 'badge badge-resolved' };
const STATUS_LABELS   = { applied: 'Assigned', 'in-progress': 'In Progress', done: 'Done ✓', resolved: 'Resolved ✓', history: 'History ✓' };

const GrievanceList = ({ filter: initialFilter }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { grievances, isLoading } = useSelector(state => state.contractor);
    const [activeTab, setActiveTab] = useState(initialFilter || 'applied');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchGrievances(activeTab));
    }, [dispatch, activeTab]);

    const filteredGrievances = grievances.filter(g =>
        g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.ticketID?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grievance-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>{initialFilter === 'history' || initialFilter === 'done' ? 'Task History' : 'My Tasks'}</h1>
                    <p>{initialFilter === 'history' || initialFilter === 'done' ? 'All completed and resolved tickets.' : 'Manage your assigned service requests.'}</p>
                </div>
                <div className="search-box">
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by ID or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {!initialFilter && (
                <div className="filter-tabs">
                    {[
                        { key: 'applied',     label: 'Assigned' },
                        { key: 'in-progress', label: 'In Progress' },
                        { key: 'done',        label: 'Completed' },
                    ].map(t => (
                        <button
                            key={t.key}
                            className={activeTab === t.key ? 'tab-btn active' : 'tab-btn'}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="grievance-list">
                {isLoading ? (
                    <div className="loader">
                        <div className="spinner" />
                        <p>Loading tasks...</p>
                    </div>
                ) : filteredGrievances.length > 0 ? (
                    filteredGrievances.map(g => (
                        <div
                            key={g._id}
                            className="grievance-card"
                            onClick={() => navigate(`/grievances/${g._id}`)}
                        >
                            <div
                                className="card-priority-line"
                                style={{ background: PRIORITY_COLORS[g.priority] || '#8b949e' }}
                            />
                            <div className="card-main">
                                <div className="card-header">
                                    <span className="ticket-id">{g.ticketID}</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className={STATUS_CLASSES[g.status] || 'badge'}>
                                            {STATUS_LABELS[g.status] || g.status}
                                        </span>
                                        <span className={`badge badge-${g.priority?.toLowerCase()}`}>
                                            {g.priority}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="subject">{g.subject}</h3>
                                <div className="meta-info">
                                    <span><MapPin size={13} /> {g.location?.locationName || g.location || 'Unknown Location'}{g.floor ? ` · Floor ${g.floor}` : ''}</span>
                                    <span><Calendar size={13} /> {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    {g.dueAt && <span><Clock size={13} /> Due: {new Date(g.dueAt).toLocaleDateString()}</span>}
                                </div>
                            </div>
                            <div className="card-actions">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <AlertTriangle size={44} />
                        <p>No {activeTab === 'applied' ? 'assigned' : activeTab} tasks found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrievanceList;
