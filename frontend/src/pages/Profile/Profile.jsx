import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchContractorProfile, updateContractorProfile } from '../../redux/slices/contractorSlice';
import { 
  User, Mail, Phone, Wrench, Shield, Camera, Save, 
  CheckCircle, AlertCircle, Edit3, Lock, Eye, EyeOff,
  Navigation, Award, Clock, List, TrendingUp, ShieldAlert,
  MapPin, Calendar, ChevronRight
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip as RechartsTooltip, Legend, Cell
} from 'recharts';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './Profile.css';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLLEGE_CENTER = [21.4988, 73.0081];
const GEOFENCE_RADIUS = 500;

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 500);
    }, [map]);
    return null;
};

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { 
        profile, 
        isLoading, 
        profileStats, 
        priorityBreakdown, 
        criticalityBreakdown, 
        monthlyTrend, 
        recentTasks 
    } = useSelector(state => state.contractor);
    const [isEditing, setIsEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [form, setForm] = useState({
        fName: '',
        midName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        skills: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        dispatch(fetchContractorProfile());
    }, [dispatch]);

    useEffect(() => {
        const p = profile || user;
        if (p) {
            setForm(prev => ({
                ...prev,
                fName: p.fName || '',
                midName: p.midName || '',
                lastName: p.lastName || '',
                email: p.email || '',
                phoneNumber: p.phoneNumber || '',
                specialization: p.specialization || '',
                skills: Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || ''),
            }));
            if (p.profilePicture) setAvatarPreview(p.profilePicture);
        }
    }, [profile, user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaveError('');
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setSaveError('Passwords do not match.');
            return;
        }

        const payload = {
            fName: form.fName,
            midName: form.midName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            specialization: form.specialization,
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        };
        if (form.newPassword) payload.newPassword = form.newPassword;

        const result = await dispatch(updateContractorProfile(payload));
        if (result.meta.requestStatus === 'fulfilled') {
            setSaveSuccess(true);
            setIsEditing(false);
            setForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            setTimeout(() => setSaveSuccess(false), 3000);
        } else {
            setSaveError('Failed to save changes. Please try again.');
        }
    };

    const p = profile || user || {};
    const fullName = [p.fName, p.midName, p.lastName].filter(Boolean).join(' ');
    const initials = `${p.fName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
                        ) : (
                            <div className="avatar-initials">{initials || 'U'}</div>
                        )}
                        {isEditing && (
                            <label className="avatar-upload-btn" title="Change photo">
                                <Camera size={16} />
                                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        )}
                    </div>
                    <div className="profile-meta">
                        <h1 className="profile-name">{fullName || 'Contractor'}</h1>
                        <span className="profile-role">
                            <Shield size={14} /> Contractor Terminal
                        </span>
                        <span className="profile-spec">{p.specialization || 'General Maintenance'}</span>
                        <div className="profile-identity-sub">
                            <span className="p-sub-item"><Navigation size={12}/> Floor {p.contractorDetails?.currentFloor ?? 'N/A'}</span>
                            <span className="p-sub-item"><Award size={12}/> Joined {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-header-actions">
                    {saveSuccess && (
                        <div className="save-banner success">
                            <CheckCircle size={16} /> Profile saved successfully!
                        </div>
                    )}
                    {saveError && (
                        <div className="save-banner error">
                            <AlertCircle size={16} /> {saveError}
                        </div>
                    )}
                    {!isEditing ? (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleSave} disabled={isLoading}>
                                <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-grid">
                {/* ── Personal Information ── */}
                <div className="profile-card glass-panel">
                    <h3 className="profile-card-title">
                        <User size={18} /> Personal Information
                    </h3>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>First Name</label>
                            {isEditing ? (
                                <input name="fName" value={form.fName} onChange={handleChange} placeholder="First name" />
                            ) : (
                                <p>{p.fName || '—'}</p>
                            )}
                        </div>
                        <div className="form-field">
                            <label>Middle Name</label>
                            {isEditing ? (
                                <input name="midName" value={form.midName} onChange={handleChange} placeholder="Middle name (optional)" />
                            ) : (
                                <p>{p.midName || '—'}</p>
                            )}
                        </div>
                        <div className="form-field">
                            <label>Last Name</label>
                            {isEditing ? (
                                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                            ) : (
                                <p>{p.lastName || '—'}</p>
                            )}
                        </div>
                        <div className="form-field">
                            <label><Phone size={14} /> Phone Number</label>
                            {isEditing ? (
                                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone number" />
                            ) : (
                                <p>{p.phoneNumber || '—'}</p>
                            )}
                        </div>
                        <div className="form-field full-span">
                            <label><Mail size={14} /> Email Address</label>
                            <p className="read-only-field">{p.email || '—'}</p>
                            <span className="field-note">Email cannot be changed. Contact admin if needed.</span>
                        </div>
                    </div>
                </div>

                {/* ── Work Profile ── */}
                <div className="profile-card glass-panel">
                    <h3 className="profile-card-title">
                        <Wrench size={18} /> Work Profile
                    </h3>
                    <div className="form-grid">
                        <div className="form-field full-span">
                            <label>Specialization</label>
                            {isEditing ? (
                                <input
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g. Plumbing, Electrical, HVAC..."
                                />
                            ) : (
                                <p>{p.specialization || '—'}</p>
                            )}
                        </div>
                        <div className="form-field full-span">
                            <label>Skills <span className="field-hint-inline">comma-separated</span></label>
                            {isEditing ? (
                                <textarea
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="e.g. Pipe repair, Welding, AC servicing..."
                                />
                            ) : (
                                <div className="skills-list">
                                    {(Array.isArray(p.skills) ? p.skills : (p.skills || '').split(',')).filter(Boolean).map((s, i) => (
                                        <span key={i} className="skill-tag">{s.trim()}</span>
                                    ))}
                                    {!p.skills && <p>No skills listed.</p>}
                                </div>
                            )}
                        </div>
                        <div className="form-field">
                            <label>Employee ID</label>
                            <p className="read-only-field">{p.employeeId || p._id?.slice(-8).toUpperCase() || '—'}</p>
                        </div>
                        <div className="form-field">
                            <label>Account Status</label>
                            <span className={`status-pill ${p.status === 'Active' ? 'active' : 'inactive'}`}>
                                {p.status || 'Active'}
                            </span>
                        </div>
                        
                        {/* ── Reporting Zone Map ── */}
                        <div className="form-field full-span reporting-zone-field">
                            <label><MapPin size={14} /> Primary Reporting Zone</label>
                            <div className="profile-map-container glass-panel">
                                <MapContainer 
                                    center={p.contractorDetails?.location?.coordinates ? [p.contractorDetails.location.coordinates[1], p.contractorDetails.location.coordinates[0]] : COLLEGE_CENTER} 
                                    zoom={16} 
                                    style={{ height: '240px', width: '100%', borderRadius: '12px' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Circle 
                                        center={COLLEGE_CENTER} 
                                        radius={GEOFENCE_RADIUS} 
                                        pathOptions={{ color: '#388bfd', fillColor: '#388bfd', fillOpacity: 0.1 }} 
                                    />
                                    {p.contractorDetails?.location?.coordinates && (
                                        <Marker position={[p.contractorDetails.location.coordinates[1], p.contractorDetails.location.coordinates[0]]} />
                                    )}
                                    <MapResizer />
                                </MapContainer>
                                <div className="map-hint">This marker indicates your primary assigned reporting area within the campus.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Change Password ── */}
                {isEditing && (
                    <div className="profile-card glass-panel password-card">
                        <h3 className="profile-card-title">
                            <Lock size={18} /> Change Password
                        </h3>
                        <p className="card-desc">Leave blank to keep your current password.</p>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>New Password</label>
                                <div className="password-input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                    />
                                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Account Stats ── */}
                <div className="profile-card glass-panel stats-card-legacy" style={{ display: 'none' }}>
                    <h3 className="profile-card-title">Account Overview</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-number">{profileStats?.resolved || 0}</span>
                            <span className="stat-label">Tasks Done</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{p.rating ? `${p.rating}/5` : '—'}</span>
                            <span className="stat-label">Rating</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
                            <span className="stat-label">Joined</span>
                        </div>
                    </div>
                </div>

                {/* ── KPI Grid ── */}
                <div className="profile-kpi-grid full-span">
                    <div className="kpi-card glass-panel kpi-blue">
                        <div className="kpi-icon"><List size={18} /></div>
                        <div className="kpi-data">
                            <span className="kpi-val">{profileStats?.total || 0}</span>
                            <span className="kpi-lbl">Total Tasks</span>
                        </div>
                    </div>
                    <div className="kpi-card glass-panel kpi-yellow">
                        <div className="kpi-icon"><Clock size={18} /></div>
                        <div className="kpi-data">
                            <span className="kpi-val">{profileStats?.activeTasksCount || 0}</span>
                            <span className="kpi-lbl">Current Active</span>
                        </div>
                    </div>
                    <div className="kpi-card glass-panel kpi-green">
                        <div className="kpi-icon"><CheckCircle size={18} /></div>
                        <div className="kpi-data">
                            <span className="kpi-val">{(profileStats?.done || 0) + (profileStats?.resolved || 0)}</span>
                            <span className="kpi-lbl">Total Resolved</span>
                        </div>
                    </div>
                    <div className="kpi-card glass-panel kpi-purple">
                        <div className="kpi-icon"><TrendingUp size={18} /></div>
                        <div className="kpi-data">
                            <span className="kpi-val">{profileStats?.completionRate || 0}%</span>
                            <span className="kpi-lbl">Completion Rate</span>
                        </div>
                    </div>
                </div>

                {/* ── Detailed Analytics ── */}
                <div className="profile-analytics-section full-span">
                    <div className="analytics-left">
                        {/* Avg Resolution */}
                        <div className="glass-panel profile-res-time" style={{ marginBottom: '24px' }}>
                            <div className="res-time-label">
                                <Clock size={16} color="#e3b341" />
                                <span>Avg. Resolution Time</span>
                            </div>
                            <span className="res-time-val">
                                {profileStats?.avgResolutionHours !== null
                                    ? `${profileStats?.avgResolutionHours} hours`
                                    : '— No data yet'}
                            </span>
                        </div>

                        {/* Priority Breakdown */}
                        <div className="glass-panel breakdown-panel" style={{ marginBottom: '24px' }}>
                            <h4 className="breakdown-title"><TrendingUp size={14}/> Priority Distribution</h4>
                            {[
                                { label: 'High', val: priorityBreakdown?.high, color: '#f85149' },
                                { label: 'Medium', val: priorityBreakdown?.medium, color: '#e3b341' },
                                { label: 'Low', val: priorityBreakdown?.low, color: '#3fb950' },
                            ].map(item => (
                                <div key={item.label} className="brkd-row">
                                    <span className="brkd-lbl">{item.label}</span>
                                    <div className="brkd-bar-track">
                                        <div className="brkd-bar-fill" style={{
                                            width: profileStats?.total > 0 ? `${(item.val / profileStats?.total) * 100}%` : '0%',
                                            background: item.color
                                        }}></div>
                                    </div>
                                    <span className="brkd-count" style={{ color: item.color }}>{item.val || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* Criticality Breakdown */}
                        <div className="glass-panel breakdown-panel">
                            <h4 className="breakdown-title"><ShieldAlert size={14}/> Criticality Breakdown</h4>
                            {[
                                { label: 'Emergency', val: criticalityBreakdown?.emergency, color: '#f85149' },
                                { label: 'Critical', val: criticalityBreakdown?.critical, color: '#e3b341' },
                                { label: 'Normal', val: criticalityBreakdown?.normal, color: '#3fb950' },
                            ].map(item => (
                                <div key={item.label} className="brkd-row">
                                    <span className="brkd-lbl">{item.label}</span>
                                    <div className="brkd-bar-track">
                                        <div className="brkd-bar-fill" style={{
                                            width: profileStats?.total > 0 ? `${(item.val / profileStats?.total) * 100}%` : '0%',
                                            background: item.color
                                        }}></div>
                                    </div>
                                    <span className="brkd-count" style={{ color: item.color }}>{item.val || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="analytics-right">
                        {/* Monthly Trend Chart */}
                        <div className="glass-panel trend-panel" style={{ height: '100%', minHeight: '350px' }}>
                            <h4 className="breakdown-title" style={{ marginBottom: '20px' }}>
                                <TrendingUp size={14}/> Monthly Task Activity 
                            </h4>
                            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                                {monthlyTrend && monthlyTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="label" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                itemStyle={{ color: '#388bfd' }}
                                            />
                                            <Bar dataKey="count" fill="#388bfd" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-chart-msg">No activity recorded in the last 6 months.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Activity Table ── */}
                <div className="profile-card glass-panel full-span recent-tasks-panel">
                    <div className="section-header-custom">
                        <h3 className="profile-card-title"><List size={18} /> Recent Task Activity</h3>
                        <span className="task-count-badge">{recentTasks?.length || 0} Recent Tasks</span>
                    </div>
                    <div className="tasks-table-wrapper">
                        {recentTasks && recentTasks.length > 0 ? (
                            <table className="custom-tasks-table">
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Subject</th>
                                        <th>Location</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTasks.map(task => (
                                        <tr key={task._id}>
                                            <td className="ticket-cell">#{task.ticketID}</td>
                                            <td className="subject-cell">
                                                <div className="subj-title">{task.subject}</div>
                                                <div className="subj-sub">By {task.submittedBy}</div>
                                            </td>
                                            <td className="loc-cell">
                                                <div className="loc-name">{task.location}</div>
                                                <div className="loc-floor">Floor {task.floor}</div>
                                            </td>
                                            <td>
                                                <span className={`prio-tag prio-${task.priority?.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`stat-tag stat-${task.status}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-tasks-msg">
                                <AlertCircle size={32} />
                                <p>No recent tasks found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
