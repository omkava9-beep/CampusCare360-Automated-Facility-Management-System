import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievances, approveGrievance, rejectGrievance } from '../../redux/slices/grievanceSlice';
import {
  ClipboardList, AlertCircle, FileSearch, CheckCircle, XCircle,
  User, MapPin, Search, Clock, CheckCircle2, Circle, ChevronRight, X
} from 'lucide-react';

// Status step helper
const getStepState = (status, step) => {
  const order = ['applied', 'in-progress', 'done', 'resolved'];
  const idx = order.indexOf(status);
  const stepIdx = order.indexOf(step);
  if (idx >= stepIdx) return 'done';
  if (idx === stepIdx - 1) return 'active';
  return 'pending';
};

const StepIcon = ({ state }) => {
  if (state === 'done') return <CheckCircle2 size={20} className="step-icon step-done" />;
  if (state === 'active') return <Circle size={20} className="step-icon step-active" />;
  return <Circle size={20} className="step-icon step-pending" />;
};

const PriorityBadge = ({ priority, status }) => {
  if (status === 'resolved') return <span className="grievance-badge badge-resolved">✓ Resolved</span>;
  const cls = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' }[priority] || 'badge-medium';
  return <span className={`grievance-badge ${cls}`}>{priority?.toUpperCase()} PRIORITY</span>;
};

const API_BASE_URL = 'http://localhost:4000'; // Make sure this matches your backend

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
        <ClipboardList size={28} color="rgba(255,255,255,0.15)" />
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className} 
      onClick={() => onPreview(imageUrl)}
      style={{ cursor: 'pointer' }}
    />
  );
};

const GrievanceCard = ({ grievance, onReview, onImagePreview }) => {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const steps = [
    { key: 'applied', label: 'Submitted' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className={`grievance-card glass-panel ${grievance.status}`}>
      {/* Left: Category Color Bar */}
      <div className={`grievance-card-accent accent-${grievance.priority?.toLowerCase()}`} />

      {/* Thumbnail */}
      <div className="grievance-thumb">
        <GrievanceImage 
          src={grievance.initialPhoto} 
          alt="Incident" 
          className="grievance-thumb-img" 
          onPreview={onImagePreview}
        />
        <span className="grievance-ticket-badge">{grievance.ticketID}</span>
      </div>

      {/* Main Content */}
      <div className="grievance-card-body">
        <div className="grievance-card-top">
          <div>
            <h3 className="grievance-title">{grievance.subject}</h3>
            <p className="grievance-meta">
              Submitted on {date}
              {grievance.category && <> • <span>{grievance.category}</span></>}
            </p>
          </div>
          <PriorityBadge priority={grievance.priority} status={grievance.status} />
        </div>

        {/* Progress Timeline */}
        <div className="grievance-timeline">
          {steps.map((step, i) => {
            const state = getStepState(grievance.status, step.key);
            return (
              <div key={step.key} className="timeline-step">
                <StepIcon state={state} />
                <span className={`timeline-label tl-${state}`}>{step.label}</span>
                {i < steps.length - 1 && (
                  <div className={`timeline-connector ${getStepState(grievance.status, steps[i + 1].key) !== 'pending' ? 'connector-done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: contractor / action */}
        <div className="grievance-card-footer">
          <div className="grievance-footer-left">
            {grievance.assignedContractor ? (
              <>
                <div className="contractor-mini-avatar">
                  {grievance.assignedContractor.charAt(0).toUpperCase()}
                </div>
                <span className="contractor-assigned-text">
                  Assigned to <strong>{grievance.assignedContractor}</strong>
                  {grievance.location && <> · <MapPin size={11} /> {grievance.location}{grievance.floor !== undefined ? ` · Fl.${grievance.floor}` : ''}</>}
                </span>
              </>
            ) : (
              <span className="grievance-waiting">
                <Clock size={13} /> Waiting for assignment...
              </span>
            )}
          </div>

          <div className="grievance-footer-actions">
            {grievance.status === 'done' && (
              <button className="review-action-btn" onClick={() => onReview(grievance)}>
                Review &amp; Approve <ChevronRight size={14} />
              </button>
            )}
            <button className="view-details-link" onClick={() => onReview(grievance)}>
              View Details
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
    { key: 'all', label: 'All' },
    { key: 'applied', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resolution Hub</h1>
          <p className="page-subtitle">Campus maintenance incident feed and approval workflow.</p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="grievance-controls">
        <div className="grievance-search-box glass-panel">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by ticket ID or subject..."
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
        <div className="loading">Loading incident feed...</div>
      ) : filtered.length === 0 ? (
        <div className="no-data glass-panel" style={{ marginTop: '24px' }}>
          <FileSearch size={48} color="rgba(139, 148, 158, 0.2)" style={{ marginBottom: '20px' }} />
          <p>No incidents match the current filter.</p>
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
              Load more grievances ▾
            </button>
          )}
        </>
      )}

      {/* Detailed Grievance Modal */}
      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '1100px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-text-group">
                <h2 className="modal-title">Grievance Details</h2>
                <p className="modal-subtitle">Full analysis for Ticket {selectedGrievance.ticketID}</p>
              </div>
              <button className="close-modal" onClick={() => setSelectedGrievance(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Photo Section (If any photo exists) */}
              {(selectedGrievance.initialPhoto || selectedGrievance.resolvedPhoto) && (
                <div className="approval-photos" style={{ marginBottom: '24px' }}>
                  <div className="photo-comparison">
                    {selectedGrievance.initialPhoto && (
                      <div className="photo-box">
                        <label>Initial Incident</label>
                        <GrievanceImage 
                            src={selectedGrievance.initialPhoto} 
                            alt="Initial" 
                            className="comparison-img" 
                            onPreview={setPreviewImage} 
                        />
                      </div>
                    )}
                    {selectedGrievance.resolvedPhoto && (
                      <div className="photo-box">
                        <label>Resolution Proof</label>
                        <GrievanceImage 
                            src={selectedGrievance.resolvedPhoto} 
                            alt="Resolved" 
                            className="comparison-img highlight" 
                            onPreview={setPreviewImage} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grievance-full-details mt-4">
                <div className="details-section">
                  <h4 className="section-label">Incident Information</h4>
                  <div className="details-grid-premium">
                    <div className="detail-item-premium">
                      <label>Subject</label>
                      <span>{selectedGrievance.subject}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Ticket ID</label>
                      <span style={{ color: '#a371f7' }}>{selectedGrievance.ticketID}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Category</label>
                      <span className="badge-category">{selectedGrievance.category || 'Not Categorized'}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Current Status</label>
                      <span className={`status-badge ${selectedGrievance.status}`}>
                        {selectedGrievance.status?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Priority</label>
                      <span className={`badge-priority ${selectedGrievance.priority?.toLowerCase()}`}>{selectedGrievance.priority}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Criticality</label>
                      <span className={`badge-criticality ${selectedGrievance.criticality?.toLowerCase()}`}>{selectedGrievance.criticality}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Location</label>
                      <span>{selectedGrievance.location || 'Unknown'} (Floor {selectedGrievance.floor})</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Submitted By</label>
                      <span>{selectedGrievance.submittedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section mt-3">
                  <h4 className="section-label">Incident Description</h4>
                  <p className="description-text">{selectedGrievance.description || 'No description provided.'}</p>
                </div>

                {selectedGrievance.assignedContractor && (
                  <div className="details-section mt-3">
                    <h4 className="section-label">Contractor Performance</h4>
                    <div className="details-grid-premium">
                      <div className="detail-item-premium">
                          <label>Assigned Contractor</label>
                          <span>{selectedGrievance.assignedContractor}</span>
                      </div>
                      <div className="detail-item-premium">
                          <label>Submission Date</label>
                          <span>{new Date(selectedGrievance.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedGrievance.contractorNotes && (
                      <div className="contractor-notes-box mt-2">
                          <label>Completion Notes:</label>
                          <p>{selectedGrievance.contractorNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => setSelectedGrievance(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal (Top Level) */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div 
            className="modal-content glass-panel" 
            style={{ maxWidth: '1000px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="header-text-group">
                <h2 className="modal-title">Evidence Preview</h2>
                <p className="modal-subtitle">Full resolution capture</p>
              </div>
              <button className="close-modal" onClick={() => setPreviewImage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
              <img 
                src={previewImage} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grievances;
