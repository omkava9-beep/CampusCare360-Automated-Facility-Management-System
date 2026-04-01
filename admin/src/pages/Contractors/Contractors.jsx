import { UserPlus, Briefcase, X, UserCheck, Mail, ShieldAlert, Award, MapPin, Navigation, User, Clock, CheckCircle2, List, TrendingUp, ShieldCheck, UserCog, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchContractors, updateContractorStatus, createContractor, fetchContractorDetailedStats, clearSelectedContractor } from '../../redux/slices/contractorSlice';
import { useMap } from 'react-leaflet';
import './DirectoryStyles.css';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// College Geofence Settings
const COLLEGE_CENTER = [21.4988, 73.0081]; // P.P. Savani University
const GEOFENCE_RADIUS = 500; // 500 meters radius from center

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            const distance = L.latLng(COLLEGE_CENTER).distanceTo([lat, lng]);
            
            if (distance <= GEOFENCE_RADIUS) {
                setPosition({ lat, lng });
            } else {
                alert("Please select a location within the college campus boundary!");
            }
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} draggable={true} 
        eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const { lat, lng } = marker.getLatLng();
                const distance = L.latLng(COLLEGE_CENTER).distanceTo([lat, lng]);
                if (distance <= GEOFENCE_RADIUS) {
                    setPosition({ lat, lng });
                } else {
                    alert("Location restricted to college area!");
                    marker.setLatLng([position.lat, position.lng]);
                }
            }
        }}
    /> : null;
};


const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        // Force a resize calculation shortly after mounting in the modal
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }, [map]);
    return null;
};


const Contractors = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { list, isLoading, selectedContractorDetails, isStatsLoading } = useSelector((state) => state.contractors);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fName: '',
    lastName: '',
    email: '',
    password: '',
    specialization: '',
    currentFloor: '',
    latitude: '',
    longitude: ''
  });
  const [showViewMap, setShowViewMap] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewingContractor, setViewingContractor] = useState(null);

  useEffect(() => {
    dispatch(fetchContractors());
  }, [dispatch]);

  // Handle deep-linking to profile from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewProfileId = params.get('viewProfile');
    if (viewProfileId) {
      handleViewProfile(viewProfileId);
    }
  }, [location.search, list]); // Re-run when list is loaded or search changes

  const handleStatusChange = (userId, newState) => {
    dispatch(updateContractorStatus({ userId, newState }));
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
        alert("Please select a location on the map!");
        return;
    }
    const result = await dispatch(createContractor({
        ...formData,
        currentFloor: parseInt(formData.currentFloor),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
    }));
    if (createContractor.fulfilled.match(result)) {
        setFormData({ fName: '', lastName: '', email: '', password: '', specialization: '', currentFloor: '', latitude: '', longitude: '' });
        setShowModal(false);
    } else {
        alert(result.payload || "Failed to onboard contractor");
    }
  };

  const handleViewProfile = (userId) => {
    dispatch(fetchContractorDetailedStats(userId));
    setShowProfile(true);
  };

  const closeProfile = () => {
    setShowProfile(false);
    dispatch(clearSelectedContractor());
  };

  const setMapPosition = (pos) => {
    setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
  };


  return (
    <div className="directory-container page-container">
      {/* Background Orbs */}
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(63, 185, 80, 0.08) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.08) 0%, transparent 70%)' }}></div>
      </div>

      <header className="directory-header">
        <div>
            <h1 className="page-title">Service Personnel</h1>
            <p className="page-subtitle">Directory of verified maintenance contractors and facility experts.</p>
        </div>
        
        <button className="primary-button shiny-btn" onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            Onboard Contractor
        </button>
      </header>

      {isLoading ? (
        <div className="loading-container" style={{ padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Accessing contractor database...</p>
        </div>
      ) : (
        <div className="directory-table-wrapper glass-panel">
          <div className="table-header-premium">
             <Briefcase size={20} color="var(--accent-primary)" />
             <h3>Active Directory</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="directory-table">
                <thead>
                <tr>
                    <th>Personnel</th>
                    <th>Contact</th>
                    <th>Expertise</th>
                    <th>Status</th>
                    <th>Management</th>
                </tr>
                </thead>
                <tbody>
                {list.map((contractor) => (
                    <tr key={contractor._id}>
                    <td>
                        <div className="personnel-cell">
                            <div className="personnel-avatar" style={{ background: 'linear-gradient(135deg, #3fb950 0%, #388bfd 100%)' }}>
                                {contractor.fName[0]}{contractor.lastName[0]}
                            </div>
                            <span className="personnel-name">{`${contractor.fName} ${contractor.lastName}`}</span>
                        </div>
                    </td>
                    <td>{contractor.email}</td>
                    <td>
                        <span className="expertise-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                            {contractor.contractorDetails?.specialization || 'General Maintenance'}
                        </span>
                    </td>
                    <td>
                        <span className={`status-badge ${contractor.status?.toLowerCase()}`}>
                        {contractor.status}
                        </span>
                    </td>
                    <td>
                        <div className="management-actions">
                        <select 
                            value={contractor.status} 
                            onChange={(e) => handleStatusChange(contractor._id, e.target.value)}
                            className="status-dropdown"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                        <button 
                            className="action-icon-btn"
                            onClick={() => handleViewProfile(contractor._id)}
                            title="View Full Profile"
                        >
                            <UserCog size={16} />
                        </button>
                        <button 
                            className="action-icon-btn"
                            onClick={() => {
                                setViewingContractor(contractor);
                                setShowViewMap(true);
                            }}
                            title="View Assigned Location"
                        >
                            <Navigation size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {list.length === 0 && (
            <div className="no-data" style={{ padding: '60px', textAlign: 'center' }}>
                <ShieldAlert size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '16px' }} />
                <p>No personnel records found in this category.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '720px' }}>
                <div className="modal-header">
                    <UserPlus size={24} color="#388bfd" />
                    <h2>Contractor Registration</h2>
                    <button className="close-modal" onClick={() => setShowModal(false)}><X size={20}/></button>
                </div>
                <form onSubmit={handleOnboard} className="modal-form">
                    {/* Personal Information Section */}
                    <div>
                        <div className="form-section-title">
                            <UserCheck size={16} />
                            <span>Personal Information</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John"
                                    value={formData.fName}
                                    onChange={(e) => setFormData({...formData, fName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Credentials Section */}
                    <div>
                        <div className="form-section-title">
                            <Mail size={16} />
                            <span>Account Credentials</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="contractor@service.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Details Section */}
                    <div>
                        <div className="form-section-title">
                            <Award size={16} />
                            <span>Professional Details</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Specialization</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Plumbing, Electrical"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Base Floor / Department</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={formData.currentFloor}
                                    onChange={(e) => setFormData({...formData, currentFloor: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Assignment Section */}
                    <div>
                        <div className="form-section-title">
                            <Navigation size={16} />
                            <span>Work Assignment Zone</span>
                        </div>
                        <div className="map-picker-container glass-panel">
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                Click inside the blue circle to assign the contractor's primary reporting location within campus
                            </p>
                            <MapContainer 
                                center={COLLEGE_CENTER} 
                                zoom={18} 
                                style={{ height: '320px', width: '100%', borderRadius: '12px', marginBottom: '8px' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                                />
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                    opacity={0.8}
                                />
                                <Circle 
                                    center={COLLEGE_CENTER} 
                                    radius={GEOFENCE_RADIUS}
                                    pathOptions={{ color: '#388bfd', fillColor: '#388bfd', fillOpacity: 0.1 }}
                                />
                                <LocationPicker 
                                    position={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null} 
                                    setPosition={setMapPosition} 
                                />
                                <MapResizer />
                            </MapContainer>
                            <div className="map-hint">
                                📍 {formData.latitude ? `Location selected: (${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)})` : 'Click on map to select location'}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label><MapPin size={14} /> Latitude</label>
                                <input 
                                    type="number" 
                                    step="any"
                                    placeholder="Auto-filled by map"
                                    value={formData.latitude}
                                    readOnly
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input 
                                    type="number" 
                                    step="any"
                                    placeholder="Auto-filled by map"
                                    value={formData.longitude}
                                    readOnly
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="primary-button full-width">
                        🚀 Onboard Service Personnel
                    </button>
                </form>
            </div>
        </div>
      )}
      {/* Contractor Profile Details Modal */}
      {showProfile && (
        <div className="modal-overlay profile-overlay">
            <div className="profile-modal-fullscreen glass-panel">
                {/* HEADER */}
                <div className="profile-modal-header">
                    <div className="profile-header-left">
                        <User size={22} color="#388bfd" />
                        <div>
                            <h2>Contractor Analytics</h2>
                            <p>Comprehensive performance dashboard &amp; task history</p>
                        </div>
                    </div>
                    <button className="close-modal" onClick={closeProfile}><X size={20}/></button>
                </div>

                {isStatsLoading ? (
                    <div className="loading-profile">
                        <div className="loading-spinner-ring"></div>
                        <p>Analyzing personnel records...</p>
                    </div>
                ) : selectedContractorDetails ? (() => {
                    const s = selectedContractorDetails.stats;
                    const c = selectedContractorDetails.contractor;
                    const pd = selectedContractorDetails.priorityBreakdown;
                    const cd = selectedContractorDetails.criticalityBreakdown;
                    const trend = selectedContractorDetails.monthlyTrend || [];
                    const maxTrend = Math.max(...trend.map(t => t.count), 1);
                    return (
                    <div className="profile-modal-body">
                        {/* LEFT COLUMN */}
                        <div className="profile-left-col">
                            {/* Identity Card */}
                            <div className="profile-id-card glass-panel">
                                <div className="profile-avatar-xl">
                                    {c.fName[0]}{c.lastName[0]}
                                </div>
                                <h3 className="profile-name">{c.fName} {c.lastName}</h3>
                                <span className="profile-role-badge">{c.contractorDetails?.specialization || 'General'}</span>
                                <span className={`profile-status-badge ${c.status?.toLowerCase()}`}>{c.status}</span>
                                <div className="profile-id-details">
                                    <div className="pid-row"><Mail size={13}/><span>{c.email}</span></div>
                                    <div className="pid-row"><Navigation size={13}/><span>Base Floor {c.contractorDetails?.currentFloor ?? 'N/A'}</span></div>
                                    <div className="pid-row"><Award size={13}/><span>Joined {new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                                </div>
                            </div>

                            {/* KPI Cards */}
                            <div className="profile-kpi-grid">
                                <div className="kpi-card glass-panel kpi-blue">
                                    <span className="kpi-val">{s.total}</span>
                                    <span className="kpi-lbl">Total Assigned</span>
                                </div>
                                <div className="kpi-card glass-panel kpi-yellow">
                                    <span className="kpi-val">{s.applied + s.inProgress}</span>
                                    <span className="kpi-lbl">Active Now</span>
                                </div>
                                <div className="kpi-card glass-panel kpi-green">
                                    <span className="kpi-val">{s.done + s.resolved}</span>
                                    <span className="kpi-lbl">Completed</span>
                                </div>
                                <div className="kpi-card glass-panel kpi-purple">
                                    <span className="kpi-val">{s.completionRate}%</span>
                                    <span className="kpi-lbl">Efficiency</span>
                                </div>
                            </div>

                            {/* Avg Resolution Time */}
                            <div className="glass-panel profile-res-time">
                                <div className="res-time-label">
                                    <Clock size={16} color="#e3b341" />
                                    <span>Avg. Resolution Time</span>
                                </div>
                                <span className="res-time-val">
                                    {s.avgResolutionHours !== null
                                        ? `${s.avgResolutionHours}h`
                                        : '— No data'}
                                </span>
                            </div>

                            {/* Status Breakdown */}
                            <div className="glass-panel breakdown-panel">
                                <h4 className="breakdown-title"><List size={14}/> Status Breakdown</h4>
                                {[
                                    { label: 'Applied', val: s.applied, color: '#388bfd' },
                                    { label: 'In Progress', val: s.inProgress, color: '#e3b341' },
                                    { label: 'Done', val: s.done, color: '#3fb950' },
                                    { label: 'Resolved', val: s.resolved, color: '#a371f7' },
                                ].map(item => (
                                    <div key={item.label} className="brkd-row">
                                        <span className="brkd-lbl">{item.label}</span>
                                        <div className="brkd-bar-track">
                                            <div className="brkd-bar-fill" style={{
                                                width: s.total > 0 ? `${(item.val / s.total) * 100}%` : '0%',
                                                background: item.color
                                            }}></div>
                                        </div>
                                        <span className="brkd-count" style={{ color: item.color }}>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="profile-right-col">
                            {/* Priority & Criticality Row */}
                            <div className="analytics-row-two">
                                <div className="glass-panel breakdown-panel">
                                    <h4 className="breakdown-title"><TrendingUp size={14}/> Priority Distribution</h4>
                                    {[
                                        { label: 'High', val: pd.high, color: '#f85149' },
                                        { label: 'Medium', val: pd.medium, color: '#e3b341' },
                                        { label: 'Low', val: pd.low, color: '#3fb950' },
                                    ].map(item => (
                                        <div key={item.label} className="brkd-row">
                                            <span className="brkd-lbl">{item.label}</span>
                                            <div className="brkd-bar-track">
                                                <div className="brkd-bar-fill" style={{
                                                    width: s.total > 0 ? `${(item.val / s.total) * 100}%` : '0%',
                                                    background: item.color
                                                }}></div>
                                            </div>
                                            <span className="brkd-count" style={{ color: item.color }}>{item.val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="glass-panel breakdown-panel">
                                    <h4 className="breakdown-title"><ShieldAlert size={14}/> Criticality Distribution</h4>
                                    {[
                                        { label: 'Emergency', val: cd.emergency, color: '#f85149' },
                                        { label: 'Critical', val: cd.critical, color: '#e3b341' },
                                        { label: 'Normal', val: cd.normal, color: '#3fb950' },
                                    ].map(item => (
                                        <div key={item.label} className="brkd-row">
                                            <span className="brkd-lbl">{item.label}</span>
                                            <div className="brkd-bar-track">
                                                <div className="brkd-bar-fill" style={{
                                                    width: s.total > 0 ? `${(item.val / s.total) * 100}%` : '0%',
                                                    background: item.color
                                                }}></div>
                                            </div>
                                            <span className="brkd-count" style={{ color: item.color }}>{item.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Trend */}
                            <div className="glass-panel trend-panel">
                                <h4 className="breakdown-title"><TrendingUp size={14}/> Monthly Task Activity (Last 6 Months)</h4>
                                {trend.length > 0 ? (
                                    <div className="trend-bars">
                                        {trend.map((m, i) => (
                                            <div key={i} className="trend-bar-col">
                                                <span className="trend-count">{m.count}</span>
                                                <div className="trend-bar-track">
                                                    <div className="trend-bar-fill" style={{
                                                        height: `${(m.count / maxTrend) * 100}%`
                                                    }}></div>
                                                </div>
                                                <span className="trend-label">{m.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-tasks">No activity data yet.</div>
                                )}
                            </div>

                            {/* Recent Assignments Table */}
                            <div className="glass-panel tasks-table-panel">
                                <div className="section-header">
                                    <h4 className="breakdown-title" style={{margin:0}}><List size={14}/> Recent Assignments</h4>
                                    <span className="view-all-link">Last 10 Tasks</span>
                                </div>
                                {selectedContractorDetails.recentTasks.length > 0 ? (
                                    <div className="profile-tasks-scroll">
                                        <table className="profile-tasks-table">
                                            <thead>
                                                <tr>
                                                    <th>Ticket</th>
                                                    <th>Subject</th>
                                                    <th>Location</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Assigned</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedContractorDetails.recentTasks.map(task => (
                                                    <tr key={task._id}>
                                                        <td><span className="task-ticket">{task.ticketID}</span></td>
                                                        <td>
                                                            <span className="ptask-subject">{task.subject}</span>
                                                            {task.submittedBy && <span className="ptask-by">by {task.submittedBy}</span>}
                                                        </td>
                                                        <td>
                                                            {task.location
                                                                ? <><span>{task.location}</span>{task.floor !== undefined && <span className="ptask-floor"> · Fl.{task.floor}</span>}</>
                                                                : '—'}
                                                        </td>
                                                        <td>
                                                            <span className={`priority-dot priority-${task.priority?.toLowerCase()}`}>
                                                                {task.priority}
                                                            </span>
                                                        </td>
                                                        <td><span className={`task-status-tag ${task.status}`}>{task.status}</span></td>
                                                        <td><span className="ptask-date">{new Date(task.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-tasks">No tasks assigned to this personnel yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    );
                })() : (
                    <div className="error-profile">Failed to load profile data.</div>
                )}

                <div className="profile-modal-footer">
                    <button className="primary-button" onClick={closeProfile} style={{padding:'10px 40px'}}>Close Profile</button>
                </div>
            </div>
        </div>
      )}
      {/* View Location Modal */}
      {showViewMap && viewingContractor && (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <MapPin size={24} color="#388bfd" />
                    <div className="header-text-group">
                        <h2>Assigned Location</h2>
                        <p className="modal-subtitle">{viewingContractor.fName} {viewingContractor.lastName} • {viewingContractor.contractorDetails?.specialization}</p>
                    </div>
                    <button className="close-modal" onClick={() => setShowViewMap(false)}><X size={20}/></button>
                </div>
                
                <div className="view-map-container">
                    <div className="map-picker-container glass-panel no-margin">
                        <MapContainer 
                            center={viewingContractor.contractorDetails?.location?.coordinates ? 
                                [viewingContractor.contractorDetails.location.coordinates[1], viewingContractor.contractorDetails.location.coordinates[0]] : 
                                COLLEGE_CENTER
                            } 
                            zoom={18} 
                            style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution='&copy; Esri'
                            />
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                attribution='&copy; Esri'
                                opacity={0.8}
                            />
                            <Circle 
                                center={COLLEGE_CENTER} 
                                radius={GEOFENCE_RADIUS}
                                pathOptions={{ color: '#388bfd', fillColor: '#388bfd', fillOpacity: 0.1 }}
                            />
                            {viewingContractor.contractorDetails?.location?.coordinates && (
                                <Marker position={[
                                    viewingContractor.contractorDetails.location.coordinates[1], 
                                    viewingContractor.contractorDetails.location.coordinates[0]
                                ]} />
                            )}
                            <MapResizer />
                        </MapContainer>
                    </div>
                    
                    <div className="location-details-footer glass-panel mt-3">
                        <div className="detail-item">
                            <label>Latitude</label>
                            <span>{viewingContractor.contractorDetails?.location?.coordinates?.[1]?.toFixed(6) || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Longitude</label>
                            <span>{viewingContractor.contractorDetails?.location?.coordinates?.[0]?.toFixed(6) || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Base Floor</label>
                            <span>Floor {viewingContractor.contractorDetails?.currentFloor ?? 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer mt-4">
                    <button className="primary-button full-width" onClick={() => setShowViewMap(false)}>
                        Close View
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Contractors;
