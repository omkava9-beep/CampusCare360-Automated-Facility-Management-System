import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievances, approveGrievance, rejectGrievance } from '../../redux/slices/grievanceSlice';
import {
  ClipboardList, AlertCircle, CheckCircle, XCircle,
  User, MapPin, Search, Clock, CheckCircle2, ChevronRight, X,
  Image as ImageIcon, Eye
} from 'lucide-react';

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

const ApprovalCard = ({ grievance, onReview, onImagePreview }) => {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="approval-card-special glass-panel">
      <div className="approval-card-header">
        <div className="approval-card-title-group">
          <span className="approval-ticket-badge">{grievance.ticketID}</span>
          <h3 className="approval-title">{grievance.subject}</h3>
        </div>
        <span className="approval-status-pulse">Needs Review</span>
      </div>

      <div className="approval-card-body">
        <div className="approval-image-split">
          <div className="approval-img-wrapper" onClick={() => onImagePreview(getImageUrl(grievance.initialPhoto))}>
             <div className="img-label">Initial</div>
             <GrievanceImage src={grievance.initialPhoto} alt="Initial" className="approval-thumb" onPreview={onImagePreview} />
          </div>
          <div className="approval-img-wrapper" onClick={() => onImagePreview(getImageUrl(grievance.resolvedPhoto))}>
             <div className="img-label success-label">Resolved</div>
             <GrievanceImage src={grievance.resolvedPhoto} alt="Resolved" className="approval-thumb highlight-border" onPreview={onImagePreview} />
          </div>
        </div>

        <div className="approval-meta-grid">
           <div className="meta-item">
             <MapPin size={14} color="var(--text-muted)" />
             <span>Zone: {grievance.location || 'Unknown'}</span>
           </div>
           <div className="meta-item">
             <Clock size={14} color="var(--text-muted)" />
             <span>Submitted: {date}</span>
           </div>
        </div>
      </div>

      <div className="approval-card-footer">
        <div className="contractor-info-pill">
          <div className="contractor-avatar-sm">
            {grievance.assignedContractor?.charAt(0).toUpperCase()}
          </div>
          <span><strong>{grievance.assignedContractor}</strong> completed this task</span>
        </div>
        <button className="primary-button shiny-btn" onClick={() => onReview(grievance)}>
          Verify & Approve <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default function Approvals() {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.grievances);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchGrievances({ status: 'done' }));
  }, [dispatch]);

  const handleApprove = async () => {
    if (!selectedGrievance) return;
    const result = await dispatch(approveGrievance({ grievanceId: selectedGrievance._id, adminFeedback: feedback }));
    if (approveGrievance.fulfilled.match(result)) {
        setSelectedGrievance(null);
        setFeedback('');
        dispatch(fetchGrievances({ status: 'done' }));
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
        dispatch(fetchGrievances({ status: 'done' }));
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Work Approvals</h1>
          <p className="page-subtitle">Review completed tasks and verify contractor resolutions.</p>
        </div>
      </div>

      <div className="grievance-controls">
        <div className="grievance-search-box glass-panel" style={{ maxWidth: '400px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search pending approvals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Fetching pending reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="no-data glass-panel" style={{ marginTop: '24px' }}>
          <CheckCircle size={48} color="rgba(63, 185, 80, 0.2)" style={{ marginBottom: '20px' }} />
          <h3>All caught up!</h3>
          <p>There are no grievances awaiting approval at the moment.</p>
        </div>
      ) : (
        <div className="approvals-feed">
          {filtered.map(g => (
            <ApprovalCard 
              key={g._id} 
              grievance={g} 
              onReview={setSelectedGrievance}
              onImagePreview={setPreviewImage}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '1100px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-text-group">
                <h2 className="modal-title">Review Work Completion</h2>
                <p className="modal-subtitle">Approving resolution for Ticket {selectedGrievance.ticketID}</p>
              </div>
              <button className="close-modal" onClick={() => setSelectedGrievance(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="approval-photos">
                <div className="photo-comparison">
                  <div className="photo-box">
                    <label>Initial Incident</label>
                    <GrievanceImage 
                        src={selectedGrievance.initialPhoto} 
                        alt="Initial" 
                        className="comparison-img" 
                        onPreview={setPreviewImage} 
                    />
                  </div>
                  <div className="photo-box">
                    <label>Resolution Proof</label>
                    <GrievanceImage 
                        src={selectedGrievance.resolvedPhoto} 
                        alt="Resolved" 
                        className="comparison-img highlight" 
                        onPreview={setPreviewImage} 
                    />
                  </div>
                </div>
              </div>

              <div className="grievance-full-details mt-4">
                <div className="details-section">
                  <h4 className="section-label">Incident Information</h4>
                  <div className="details-grid-premium">
                    <div className="detail-item-premium">
                      <label>Subject</label>
                      <span>{selectedGrievance.subject}</span>
                    </div>
                    <div className="detail-item-premium">
                      <label>Category</label>
                      <span className="badge-category">{selectedGrievance.category}</span>
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
                      <span>{selectedGrievance.location} (Floor {selectedGrievance.floor})</span>
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

                <div className="details-section mt-3">
                   <h4 className="section-label">Contractor Performance</h4>
                   <div className="details-grid-premium">
                     <div className="detail-item-premium">
                        <label>Assigned Contractor</label>
                        <span>{selectedGrievance.assignedContractor}</span>
                     </div>
                     <div className="detail-item-premium">
                        <label>Completion Date</label>
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
              </div>

              <div className="feedback-section-premium mt-4">
                <label className="feedback-label">Admin Approval Feedback</label>
                <textarea
                  className="feedback-textarea"
                  rows="3"
                  placeholder="Verify quality of work or provide reasons for revision..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setSelectedGrievance(null)}>
                Close Review
              </button>
              <div className="footer-actions">
                <button 
                  className="reject-btn" 
                  onClick={handleReject}
                  style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.2)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <XCircle size={18} /> Request Revision
                </button>
                <button 
                  className="primary-button" 
                  onClick={handleApprove}
                >
                  <CheckCircle size={18} /> Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Evidence Preview</h2>
              <button className="close-modal" onClick={() => setPreviewImage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
