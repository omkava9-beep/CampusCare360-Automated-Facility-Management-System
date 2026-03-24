import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievanceDetail, updateGrievanceStatus, clearCurrentGrievance, acceptGrievance, rejectGrievance } from '../../redux/slices/contractorSlice';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft, MapPin, User, MessageSquare, Calendar, Clock, 
  Image as ImageIcon, CheckCircle2, PlayCircle, XCircle, 
  Navigation, Upload, AlertCircle, ShieldCheck, Info
} from 'lucide-react';
import Chat from './Chat';
import './Grievances.css';

const STATUS_FLOW = {
    applied: { label: 'Assigned', color: '#388bfd', next: 'in-progress', nextLabel: null },
    'in-progress': { label: 'In Progress', color: '#e3b341', next: 'done', nextLabel: 'Mark as Done' },
    done: { label: 'Awaiting Approval', color: '#8b949e', next: null },
    resolved: { label: 'Resolved', color: '#3fb950', next: null },
};

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { currentGrievance: g, isLoading } = useSelector(state => state.contractor);
    const [notes, setNotes] = useState('');
    const [resolvedPhoto, setResolvedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        dispatch(fetchGrievanceDetail(id));
        return () => dispatch(clearCurrentGrievance());
    }, [dispatch, id]);

    useEffect(() => {
        if (g?.contractorNotes) setNotes(g.contractorNotes);
    }, [g]);

    const handleAccept = async () => {
        await dispatch(acceptGrievance(id));
        dispatch(fetchGrievanceDetail(id));
    };

    const handleReject = async () => {
        if (window.confirm('Reject this task? It will be reassigned to another contractor.')) {
            await dispatch(rejectGrievance(id));
            navigate('/grievances');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResolvedPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleMarkDone = async () => {
        if (!resolvedPhoto) {
            alert('Please upload a photo of the completed work before marking as done.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Upload photo and update status via our secure backend endpoint
            const formData = new FormData();
            formData.append('photo', resolvedPhoto); // The field name must be 'photo' as defined in upload.single('photo')
            formData.append('notes', notes); // Contractor notes included alongside the photo

            const token = localStorage.getItem('contractorToken');
            const res = await fetch(`http://localhost:4000/api/v1/user/grievance/${id}/upload-resolved-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to upload photo');
            }

            dispatch(fetchGrievanceDetail(id));
        } catch (err) {
            // Even if cloudinary fails, submit with local notes so user doesn't lose progress
            await dispatch(updateGrievanceStatus({ id, status: 'done', notes }));
            dispatch(fetchGrievanceDetail(id));
        } finally {
            setIsSubmitting(false);
        }
    };

    const openImageModal = (src) => {
        setModalImage(src);
        setShowPhotoModal(true);
    };

    if (isLoading || !g) return (
        <div className="detail-loading">
            <div className="spinner" />
            <p>Loading ticket details...</p>
        </div>
    );

    const statusInfo = STATUS_FLOW[g.status] || { label: g.status, color: '#8b949e' };
    const priorityColor = g.priority === 'High' ? '#f85149' : g.priority === 'Medium' ? '#e3b341' : '#3fb950';

    return (
        <div className="detail-container">
            {showPhotoModal && (
                <div className="photo-fullscreen" onClick={() => setShowPhotoModal(false)}>
                    <img src={modalImage} alt="Full view" />
                    <span className="close-fs">✕</span>
                </div>
            )}

            <div className="detail-topbar">
                <button className="back-btn" onClick={() => navigate('/grievances')}>
                    <ArrowLeft size={18} /> Back to Tasks
                </button>
                <div className="detail-breadcrumb">
                    <span>{g.ticketID}</span>
                    <span className="status-badge" style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}>
                        {statusInfo.label}
                    </span>
                    <span className="priority-badge" style={{ background: `${priorityColor}20`, color: priorityColor }}>
                        {g.priority} Priority
                    </span>
                </div>
            </div>

            <h1 className="detail-title">{g.subject}</h1>

            <div className="detail-grid">
                {/* ── LEFT COLUMN ── */}
                <main className="detail-main">

                    {/* Info Card */}
                    <div className="detail-card glass-panel">
                        <h3 className="card-section-title"><Info size={16} /> Issue Details</h3>
                        <p className="description-text">{g.description || 'No description provided.'}</p>

                        <div className="info-grid">
                            <div className="info-item">
                                <label>Location</label>
                                <div className="info-row">
                                    <MapPin size={16} />
                                    <span>{g.location?.locationName || g.location} — Floor {g.location?.floorNumber || g.floor}</span>
                                </div>
                                {g.location?.coordinates?.length === 2 && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${g.location.coordinates[1]},${g.location.coordinates[0]}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="directions-link"
                                    >
                                        <Navigation size={13} /> Get Directions
                                    </a>
                                )}
                                {g.location?.operatingHours && (
                                    <span className="hours-badge"><Clock size={12} /> {g.location.operatingHours}</span>
                                )}
                            </div>
                            <div className="info-item">
                                <label>Reported By</label>
                                <div className="info-row">
                                    <User size={16} />
                                    <span>{g.submittedBy?.name || `${g.submittedBy?.fName || ''} ${g.submittedBy?.lastName || ''}`}</span>
                                </div>
                                {g.submittedBy?.phone && <span className="sub-text">{g.submittedBy.phone}</span>}
                            </div>
                            <div className="info-item">
                                <label>Category</label>
                                <span className="cat-badge">{g.category || 'General'}</span>
                            </div>
                            <div className="info-item">
                                <label>Assigned On</label>
                                <div className="info-row">
                                    <Calendar size={16} />
                                    <span>{new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Photo Comparison */}
                    <div className="detail-card glass-panel">
                        <h3 className="card-section-title"><ImageIcon size={16} /> Photo Evidence</h3>
                        <div className="photo-comparison">
                            <div className="photo-box">
                                <label>Before (Problem Photo)</label>
                                {g.initialPhoto ? (
                                    <img src={g.initialPhoto} alt="Before" className="evidence-img" onClick={() => openImageModal(g.initialPhoto)} />
                                ) : (
                                    <div className="no-photo"><ImageIcon size={32} /><p>No photo provided</p></div>
                                )}
                            </div>
                            <div className="photo-box">
                                <label>After (Resolution Photo)</label>
                                {g.resolvedPhoto ? (
                                    <img src={g.resolvedPhoto} alt="After" className="evidence-img highlight" onClick={() => openImageModal(g.resolvedPhoto)} />
                                ) : (
                                    <div className="no-photo pending"><Upload size={32} /><p>Not uploaded yet</p></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="detail-card glass-panel">
                        <h3 className="card-section-title"><MessageSquare size={16} /> Communication Thread</h3>
                        <Chat grievanceId={id} currentUser={user} />
                    </div>
                </main>

                {/* ── RIGHT SIDEBAR ── */}
                <aside className="detail-aside">
                    <div className="detail-card glass-panel task-control-panel">
                        <h3 className="card-section-title">Task Control</h3>

                        {/* Status Stepper */}
                        <div className="status-stepper">
                            {['applied', 'in-progress', 'done', 'resolved'].map((s, i) => {
                                const statuses = ['applied', 'in-progress', 'done', 'resolved'];
                                const current = statuses.indexOf(g.status);
                                const isDone = i <= current;
                                return (
                                    <div key={s} className={`step ${isDone ? 'done' : ''}`}>
                                        <div className="step-dot">{isDone ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}</div>
                                        <span>{STATUS_FLOW[s]?.label || s}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── APPLIED: Accept / Reject ── */}
                        {g.status === 'applied' && (
                            <div className="action-section">
                                <p className="action-hint-top">Review this task and accept to begin work, or reject to pass it along.</p>
                                <button className="action-btn primary full" onClick={handleAccept}>
                                    <PlayCircle size={18} /> Accept Task
                                </button>
                                <button className="action-btn danger-outline full" onClick={handleReject}>
                                    <XCircle size={18} /> Reject Task
                                </button>
                            </div>
                        )}

                        {/* ── IN-PROGRESS: Notes + Photo Upload + Submit ── */}
                        {g.status === 'in-progress' && (
                            <div className="action-section">
                                <div className="field-group">
                                    <label>Work Notes</label>
                                    <textarea
                                        className="notes-area"
                                        rows={4}
                                        placeholder="Describe what you did to fix the issue..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Resolution Photo <span className="required">*Required</span></label>
                                    <div className={`upload-box ${resolvedPhoto ? 'has-file' : ''}`} onClick={() => document.getElementById('res-photo').click()}>
                                        {photoPreview ? (
                                            <div className="preview-wrap">
                                                <img src={photoPreview} alt="Preview" />
                                                <span>Click to change</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={28} />
                                                <p>Upload photo of completed work</p>
                                                <span className="upload-hint">JPG, PNG up to 10MB</span>
                                            </>
                                        )}
                                        <input id="res-photo" type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                                    </div>
                                </div>

                                <button
                                    className={`action-btn success full ${!resolvedPhoto ? 'disabled' : ''}`}
                                    onClick={handleMarkDone}
                                    disabled={!resolvedPhoto || isSubmitting}
                                >
                                    {isSubmitting ? <><span className="btn-spinner" />Submitting...</> : <><CheckCircle2 size={18} /> Mark as Done</>}
                                </button>
                                {!resolvedPhoto && (
                                    <p className="field-hint"><AlertCircle size={12} /> Upload a photo to enable submission</p>
                                )}
                            </div>
                        )}

                        {/* ── DONE: Awaiting Approval ── */}
                        {g.status === 'done' && (
                            <div className="done-state">
                                <ShieldCheck size={40} className="done-icon" />
                                <h4>Awaiting Admin Review</h4>
                                <p>Your resolution has been submitted. The admin will verify and either approve or reassign this task.</p>
                                {g.resolvedPhoto && (
                                    <button className="ghost-btn" onClick={() => openImageModal(g.resolvedPhoto)}>
                                        <ImageIcon size={14} /> View Submitted Photo
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ── RESOLVED ── */}
                        {g.status === 'resolved' && (
                            <div className="done-state resolved">
                                <CheckCircle2 size={40} className="resolved-icon" />
                                <h4>Task Resolved ✓</h4>
                                <p>Admin has approved your resolution. Great work!</p>
                            </div>
                        )}

                        {/* Notes display for done/resolved */}
                        {(g.status === 'done' || g.status === 'resolved') && g.contractorNotes && (
                            <div className="notes-display">
                                <label>Your Work Notes</label>
                                <p>{g.contractorNotes}</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default GrievanceDetail;
