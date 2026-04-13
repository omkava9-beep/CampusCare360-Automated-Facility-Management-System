import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPendingApprovals, approveGrievance, rejectGrievance } from '../../redux/slices/grievanceSlice';
import {
  ClipboardList, AlertCircle, CheckCircle, XCircle,
  User, MapPin, Search, Clock, CheckCircle2, ChevronRight, X,
  Image as ImageIcon, Eye, ShieldCheck, Zap, ExternalLink
} from 'lucide-react';
import './Approvals.css';

const getApiUrl = () => import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const API_BASE_URL = getApiUrl();

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

const ApprovalCard = ({ grievance, onReview, onImagePreview, onContractorClick }) => {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  
  const contractorName = grievance.assignedContractor?.name || grievance.assignedContractor || 'Unassigned';
  const contractorId = grievance.assignedContractor?.id || null;

  return (
    <div className="approval-card-special glass-panel" onClick={() => onReview(grievance)}>
      <div className="approval-card-header">
        <div className="approval-card-title-group">
          <span className="approval-ticket-badge">{grievance.ticketID}</span>
          <h3 className="approval-title">{grievance.subject}</h3>
        </div>
        <span className="approval-status-pulse">Verification Needed</span>
      </div>

      <div className="approval-card-body">
        <div className="approval-image-split">
          <div className="approval-img-wrapper">
             <div className="img-label">Initial</div>
             <GrievanceImage src={grievance.initialPhoto} alt="Initial" className="approval-thumb" onPreview={onImagePreview} />
          </div>
          <div className="approval-img-wrapper">
             <div className="img-label success-label">Resolved</div>
             <GrievanceImage src={grievance.resolvedPhoto} alt="Resolved" className="approval-thumb highlight-border" onPreview={onImagePreview} />
          </div>
        </div>

        <div className="approval-meta-grid">
           <div className="meta-item">
             <MapPin size={14} />
             <span>Zone: {grievance.location || 'Unknown'} (F{grievance.floor})</span>
           </div>
           <div className="meta-item">
             <Clock size={14} />
             <span>Completed: {date}</span>
           </div>
        </div>
      </div>

      <div className="approval-card-footer">
        <div 
          className="contractor-info-pill" 
          onClick={(e) => {
            e.stopPropagation();
            if (contractorId) onContractorClick(contractorId);
          }}
          style={{ cursor: contractorId ? 'pointer' : 'default' }}
        >
          <div className="contractor-avatar-sm">
            {contractorName.charAt(0).toUpperCase()}
          </div>
          <span>
            <strong className={contractorId ? "link-hover" : ""}>{contractorName}</strong> requested verification
          </span>
        </div>
        <button className="primary-button shiny-btn" style={{ width: '100%', justifyContent: 'center' }}>
          Inspect Work <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default function Approvals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, isLoading } = useSelector((state) => state.grievances);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const handleContractorClick = (id) => {
    navigate(`/contractors?viewProfile=${id}`);
  };

  useEffect(() => {
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  const handleApprove = async () => {
    if (!selectedGrievance) return;
    const result = await dispatch(approveGrievance({ grievanceId: selectedGrievance._id, adminFeedback: feedback }));
    if (approveGrievance.fulfilled.match(result)) {
        setSelectedGrievance(null);
        setFeedback('');
        dispatch(fetchPendingApprovals());
    }
  };

  const handleReject = async () => {
    if (!selectedGrievance || !feedback) {
        alert('Please provide feedback for the contractor.');
        return;
    }
    const result = await dispatch(rejectGrievance({ grievanceId: selectedGrievance._id, adminFeedback: feedback }));
    if (rejectGrievance.fulfilled.match(result)) {
        setSelectedGrievance(null);
        setFeedback('');
        dispatch(fetchPendingApprovals());
    }
  };

  const filtered = list.filter(g => 
    g.status === 'done' && (
      !search || 
      g.ticketID?.toLowerCase().includes(search.toLowerCase()) ||
      g.subject?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="approvals-container page-container">
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(63, 185, 80, 0.1) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.1) 0%, transparent 70%)' }}></div>
      </div>

      <header className="approvals-header">
        <h1 className="page-title">Work Verification</h1>
        <p className="page-subtitle">Inspect and finalize resolutions submitted by maintenance experts.</p>
      </header>

      <div className="grievance-controls">
        <div className="grievance-search-box glass-panel" style={{ maxWidth: '400px' }}>
          <Search size={18} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search pending approvals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container" style={{ padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Fetching pending reviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="no-data glass-panel" style={{ padding: '80px', marginTop: '24px', textAlign: 'center' }}>
          <ShieldCheck size={64} color="rgba(63, 185, 80, 0.1)" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no grievances awaiting approval at the moment.</p>
        </div>
      ) : (
        <div className="approvals-feed">
          {filtered.map(g => (
            <ApprovalCard 
              key={g._id} 
              grievance={g} 
              onReview={setSelectedGrievance}
              onImagePreview={setPreviewImage}
              onContractorClick={handleContractorClick}
            />
          ))}
        </div>
      )}

      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '1000px', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px' }}>
              <div className="header-text-group">
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Quality Assurance
                </span>
                <h2 className="modal-title" style={{ fontSize: '1.75rem', marginTop: '4px' }}>Review Work: {selectedGrievance.ticketID}</h2>
              </div>
              <button className="close-modal" onClick={() => setSelectedGrievance(null)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '0 32px 32px' }}>
               <div className="details-layout-premium" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px' }}>
                    <div className="details-col-left">
                        <div className="photo-comparison-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div className="photo-box-premium">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Before</label>
                                <GrievanceImage src={selectedGrievance.initialPhoto} alt="Initial" className="comparison-img-v2" onPreview={setPreviewImage} />
                            </div>
                            <div className="photo-box-premium">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success)', marginBottom: '8px' }}>After</label>
                                <GrievanceImage src={selectedGrievance.resolvedPhoto} alt="Resolved" className="comparison-img-v2 success-glow" onPreview={setPreviewImage} />
                            </div>
                        </div>

                        <div className="description-section-premium" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#fff' }}>Contracter Completion Notes</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                                "{selectedGrievance.contractorNotes || 'No notes provided by contractor.'}"
                            </p>
                        </div>

                        <div className="feedback-entry mt-4">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Administrative Verdict</label>
                            <textarea
                                className="glass-panel"
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                                rows="3"
                                placeholder="Add verification feedback or specify required revisions..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="details-col-right">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="info-group-premium">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Task Essence</label>
                                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{selectedGrievance.subject}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Zone: {selectedGrievance.location} (Floor {selectedGrievance.floor})</div>
                            </div>

                            <div className="info-group-premium">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Assigned Expert</label>
                                <div 
                                    className="contractor-profile-link-box"
                                    onClick={() => {
                                        const id = selectedGrievance.assignedContractor?.id;
                                        if (id) handleContractorClick(id);
                                    }}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.03)', 
                                        padding: '16px', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        cursor: selectedGrievance.assignedContractor?.id ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div className="contractor-avatar-sm" style={{ width: '32px', height: '32px' }}>
                                        {(selectedGrievance.assignedContractor?.name || selectedGrievance.assignedContractor || 'U').charAt(0)}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                                        {selectedGrievance.assignedContractor?.name || selectedGrievance.assignedContractor || 'Unassigned'}
                                    </span>
                                    {selectedGrievance.assignedContractor?.id && <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                </div>
                            </div>

                            <div className="info-group-premium">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Criticality</label>
                                <span className={`badge-priority ${selectedGrievance.priority?.toLowerCase()}`}>{selectedGrievance.priority}</span>
                            </div>
                        </div>
                    </div>
               </div>
            </div>

            <div className="modal-footer" style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <button className="secondary-button" style={{ minWidth: '140px' }} onClick={() => setSelectedGrievance(null)}>
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end' }}>
                <button 
                  className="reject-btn" 
                  onClick={handleReject}
                  style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.2)', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <XCircle size={18} /> Revision Required
                </button>
                <button 
                  className="primary-button shiny-btn" 
                  onClick={handleApprove}
                  style={{ padding: '12px 32px', borderRadius: '12px' }}
                >
                  <CheckCircle size={18} /> Approve & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fullscreen-image-overlay" onClick={() => setPreviewImage(null)}>
          <button className="close-fullscreen" onClick={() => setPreviewImage(null)}>
            <X size={24} />
          </button>
          <img src={previewImage} alt="Preview" className="fullscreen-image" onClick={e => e.stopPropagation()} />
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
        .contractor-profile-link-box:hover {
            background: rgba(255,255,255,0.08) !important;
            transform: translateY(-2px);
        }
        .link-hover:hover {
            text-decoration: underline;
            color: var(--accent-primary);
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
        
        @media (max-width: 900px) {
            .details-layout-premium {
                grid-template-columns: 1fr !important;
            }
            .details-col-right {
                order: -1;
            }
            .photo-comparison-premium {
                grid-template-columns: 1fr !important;
            }
        }
      `}</style>
    </div>
  );
}
