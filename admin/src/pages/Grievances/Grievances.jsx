import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievances, approveGrievance, rejectGrievance } from '../../redux/slices/grievanceSlice';
import {
  ClipboardList, AlertCircle, FileSearch, CheckCircle, XCircle,
  User, MapPin, Search, Clock, CheckCircle2, Circle, ChevronRight, X,
  Calendar, Layers, ShieldCheck, Zap
} from 'lucide-react';
import './Grievances.css';

// Status step helper
const getStepState = (status, step) => {
  const states = {
    'applied': 0,
    'in-progress': 1,
    'done': 2,
    'resolved': 3
  };
  const current = states[status] || 0;
  const stepIdx = states[step];
  if (current > stepIdx) return 'done';
  if (current === stepIdx) return 'active';
  return 'pending';
};

const StepIcon = ({ state }) => {
  if (state === 'done') return <CheckCircle2 size={16} className="step-done" />;
  if (state === 'active') return <Circle size={16} className="step-active" strokeWidth={3} />;
  return <Circle size={16} className="step-pending" />;
};

const PriorityBadge = ({ priority, status }) => {
  if (status === 'resolved') return <span className="badge-priority badge-resolved">Resolved</span>;
  const p = priority?.toLowerCase() || 'low';
  return <span className={`badge-priority priority-${p}`}>{priority}</span>;
};

const API_BASE_URL = 'http://localhost:4000';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const GrievanceImage = ({ src, alt, className, onPreview }) => {
  const imageUrl = getImageUrl(src);
  if (!imageUrl) {
    return (
      <div className="grievance-thumb-placeholder">
        <ClipboardList size={32} color="rgba(255,255,255,0.1)" />
      </div>
    );
  }
  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className} 
      onClick={(e) => {
          e.stopPropagation();
          onPreview(imageUrl);
      }}
      loading="lazy"
    />
  );
};

const GrievanceCard = ({ grievance, onReview, onImagePreview }) => {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });

  const p = grievance.priority?.toLowerCase() || 'low';

  return (
    <div className="grievance-card-premium glass-panel" onClick={() => onReview(grievance)}>
      <div className={`grievance-card-accent priority-${p}`}></div>
      
      <div className="grievance-card-content">
          <div className="grievance-visual-side">
              <span className="grievance-ticket-badge">{grievance.ticketID}</span>
              <GrievanceImage 
                src={grievance.initialPhoto} 
                alt="Incident" 
                className="grievance-main-img" 
                onPreview={onImagePreview} 
              />
          </div>

          <div className="grievance-info-side">
              <div className="grievance-card-top">
                  <div className="grievance-title-area">
                      <span className="grievance-ticket-id">{grievance.category || 'Facility'}</span>
                      <h3>{grievance.subject}</h3>
                  </div>
                  <PriorityBadge priority={grievance.priority} status={grievance.status} />
              </div>

              <div className="grievance-meta-row">
                  <div className="meta-item-small">
                      <MapPin size={14} />
                      <span>{grievance.location || 'Unknown'} (F{grievance.floor})</span>
                  </div>
                  <div className="meta-item-small">
                      <Calendar size={14} />
                      <span>{date}</span>
                  </div>
                  <div className="meta-item-small">
                      <Clock size={14} />
                      <span style={{ textTransform: 'capitalize' }}>{grievance.status?.replace('-', ' ')}</span>
                  </div>
              </div>

              <div className="grievance-card-footer">
                  <div className="assigned-pill">
                      {grievance.assignedContractor ? (
                          <>
                            <div className="avatar-mini">
                                {grievance.assignedContractor.charAt(0).toUpperCase()}
                            </div>
                            <span>{grievance.assignedContractor}</span>
                          </>
                      ) : (
                          <span className="unassigned">Waiting for assignment...</span>
                      )}
                  </div>
                  <button className="primary-button view-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      View Details <ChevronRight size={14} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};


const Grievances = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.grievances);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const filters = activeTab === 'all' ? {} : { status: activeTab };
    dispatch(fetchGrievances(filters));
    setVisibleCount(10);
  }, [dispatch, activeTab]);


  const filtered = list.filter(g =>
    !search ||
    g.ticketID?.toLowerCase().includes(search.toLowerCase()) ||
    g.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'all', label: 'All Reports' },
    { key: 'applied', label: 'Pending' },
    { key: 'in-progress', label: 'Active' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="grievances-container page-container">
      {/* Background Orbs */}
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.15) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(163, 113, 247, 0.1) 0%, transparent 70%)' }}></div>
      </div>

      <header className="grievances-header">
        <h1 className="page-title">Resolution Hub</h1>
        <p className="page-subtitle">Premium tracking for campus maintenance and facility optimization.</p>
      </header>

      {/* Search + Filter Bar */}
      <div className="grievance-controls">
        <div className="grievance-search-box glass-panel">
          <Search size={18} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search by ticket or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="grievance-tab-pills glass-panel">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`grievance-pill ${activeTab === tab.key ? 'pill-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Feed */}
      {isLoading ? (
        <div className="loading-container" style={{ padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Syncing incident data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="no-data glass-panel" style={{ padding: '80px', marginTop: '24px', textAlign: 'center' }}>
          <FileSearch size={64} color="rgba(139, 148, 158, 0.1)" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No incidents found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <>
          <div className="grievance-feed">
            {filtered.slice(0, visibleCount).map(g => (
              <GrievanceCard 
                key={g._id} 
                grievance={g} 
                onReview={setSelectedGrievance} 
                onImagePreview={setPreviewImage}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button className="load-more-btn glass-panel" onClick={() => setVisibleCount(v => v + 10)}>
              Explore more incidents ▾
            </button>
          )}
        </>
      )}

      {/* Modern Detailed Modal */}
      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div className="modal-content grievance-details-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-text-group">
                <span className="modal-subtitle-premium">Incident Analysis</span>
                <h2 className="modal-title">Ticket {selectedGrievance.ticketID}</h2>
              </div>
              <button className="close-modal" onClick={() => setSelectedGrievance(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-layout-premium">
                
                <div className="details-col-left">
                  {/* Photo Comparison */}
                  {(selectedGrievance.initialPhoto || selectedGrievance.resolvedPhoto) && (
                    <div className="photo-comparison-premium">
                       {selectedGrievance.initialPhoto && (
                          <div className="photo-box-premium">
                              <label className="photo-label">Initial Condition</label>
                              <GrievanceImage src={selectedGrievance.initialPhoto} alt="Initial" className="comparison-img-v2" onPreview={setPreviewImage} />
                          </div>
                       )}
                       {selectedGrievance.resolvedPhoto && (
                          <div className="photo-box-premium">
                              <label className="photo-label" style={{ color: 'var(--success)' }}>Resolution Proof</label>
                              <GrievanceImage src={selectedGrievance.resolvedPhoto} alt="Resolved" className="comparison-img-v2 success-glow" onPreview={setPreviewImage} />
                          </div>
                       )}
                    </div>
                  )}

                  <div className="description-section-premium">
                      <h4>
                          <FileSearch size={16} color="var(--accent-primary)" /> Incident Description
                      </h4>
                      <p>
                          {selectedGrievance.description || 'No detailed description provided by the submitter.'}
                      </p>
                  </div>

                  {selectedGrievance.contractorNotes && (
                      <div className="notes-section-premium">
                          <h4>
                              <CheckCircle size={16} /> Contractor Insights
                          </h4>
                          <p>
                              "{selectedGrievance.contractorNotes}"
                          </p>
                      </div>
                  )}
                </div>

                <div className="details-col-right">
                    <div className="info-sidebar-premium">
                        <div className="info-group-premium">
                            <label className="sidebar-label">Quick Stats</label>
                            <div className="stats-list-premium">
                                <div className="stats-item-premium">
                                    <span>Status</span>
                                    <span className={`status-badge-inline ${selectedGrievance.status}`}>
                                        {selectedGrievance.status?.replace('-', ' ')}
                                    </span>
                                </div>
                                <div className="stats-item-premium">
                                    <span>Priority</span>
                                    <span style={{ fontWeight: 700, color: selectedGrievance.priority === 'High' ? '#f85149' : '#fff' }}>{selectedGrievance.priority}</span>
                                </div>
                                <div className="stats-item-premium">
                                    <span>Zone</span>
                                    <span style={{ fontWeight: 700, color: '#fff' }}>{selectedGrievance.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-group-premium">
                            <label className="sidebar-label">Resource Allocation</label>
                            <div className="contractor-card-mini">
                                {selectedGrievance.assignedContractor ? (
                                    <div className="contractor-info-mini">
                                        <div className="avatar-mini">
                                            {selectedGrievance.assignedContractor.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="contractor-name-mini">{selectedGrievance.assignedContractor}</span>
                                            <span className="contractor-role-mini">Facility Expert</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="unassigned-text">Unassigned</p>
                                )}
                            </div>
                        </div>

                        <div className="info-group-premium">
                            <label className="sidebar-label">Timeline</label>
                            <div className="timeline-item-premium">
                                <Clock size={16} color="var(--accent-primary)" />
                                <span>{new Date(selectedGrievance.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-button shiny-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedGrievance(null)}>
                Dismiss View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="fullscreen-image-overlay" onClick={() => setPreviewImage(null)}>
          <button className="close-fullscreen" onClick={() => setPreviewImage(null)}>
            <X size={24} />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="fullscreen-image" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx="true">{`
        .comparison-img-v2 {
            width: 100%;
            aspect-ratio: 4/3;
            object-fit: cover;
            border-radius: 12px;
            cursor: zoom-in;
            border: 1px solid rgba(255,255,255,0.08);
            transition: transform 0.3s ease;
        }
        .comparison-img-v2:hover {
            transform: scale(1.02);
        }
        .success-glow {
            border-color: rgba(63, 185, 80, 0.4);
            box-shadow: 0 0 20px rgba(63, 185, 80, 0.1);
        }
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: var(--text-muted);
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(56, 139, 253, 0.1);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .status-badge-inline {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .status-badge-inline.applied { background: rgba(56, 139, 253, 0.1); border: 1px solid rgba(56, 139, 253, 0.2); }
        .status-badge-inline.in-progress { background: rgba(163, 113, 247, 0.1); border: 1px solid rgba(163, 113, 247, 0.2); }
        .status-badge-inline.resolved { background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.2); }
        
        @media (max-width: 900px) {
            .details-layout-premium {
                grid-template-columns: 1fr !important;
            }
            .details-col-right {
                order: -1;
            }
        }
      `}</style>
    </div>
  );
};

export default Grievances;
