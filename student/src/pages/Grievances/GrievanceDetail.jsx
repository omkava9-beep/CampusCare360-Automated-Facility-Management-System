import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrievanceDetail, clearCurrentGrievance } from '../../redux/slices/studentSlice';
import {
    ArrowLeft, MapPin, Calendar, Clock,
    CheckCircle2, Image as ImageIcon, Wrench, FileText, Info, Tag
} from 'lucide-react';
import './GrievanceDetail.css';

const STEPS = [
    { key: 'applied',      label: 'Submitted'    },
    { key: 'in-progress',  label: 'In Progress'  },
    { key: 'done',         label: 'Under Review' },
    { key: 'resolved',     label: 'Resolved'     },
];

const STATUS_IDX   = { applied: 0, 'in-progress': 1, done: 2, resolved: 3 };
const STATUS_LABEL = { applied: 'Pending', 'in-progress': 'In Progress', done: 'Under Review', resolved: 'Resolved' };

const GrievanceDetail = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const dispatch     = useDispatch();
    const { currentGrievance: g, isLoading } = useSelector(s => s.student);
    const [photoModal, setPhotoModal] = useState(null);

    useEffect(() => {
        dispatch(fetchGrievanceDetail(id));
        return () => dispatch(clearCurrentGrievance());
    }, [id]);

    /* ── Loading ── */
    if (isLoading || !g) return (
        <div className="gd-page">
            <div className="gd-loading">
                <div className="spinner" />
                <span>Loading ticket…</span>
            </div>
        </div>
    );

    const currentStep   = STATUS_IDX[g.status] ?? 0;
    const progressWidth = ['0%', '33.33%', '66.66%', '100%'][currentStep];

    return (
        <div className="gd-page page-enter">

            {/* ── Photo modal ── */}
            {photoModal && (
                <div className="gd-modal-overlay" onClick={() => setPhotoModal(null)}>
                    <img src={photoModal} alt="Full view" className="gd-modal-img" />
                </div>
            )}

            {/* ══════════════════════════════════════
                HERO — full bleed
            ══════════════════════════════════════ */}
            <div className="gd-hero">
                <div className="gd-hero-left">

                    {/* Back + chips */}
                    <div className="gd-topbar">
                        <button className="gd-back" onClick={() => navigate('/tickets')}>
                            <ArrowLeft size={15} /> Back
                        </button>
                        <span className="tc-id">{g.ticketID}</span>
                        <span className={`priority-badge priority-${g.priority?.toLowerCase() || 'normal'}`}>
                            {g.priority || 'Normal'} Priority
                        </span>
                    </div>

                    <h1 className="gd-title">{g.subject}</h1>
                </div>

                {/* Current status counter — mirrors hero-right */}
                <div className="gd-hero-right">
                    <span className="gd-status-label">Current status</span>
                    <span className="gd-status-value">
                        {STATUS_LABEL[g.status] || g.status}
                    </span>
                    <span className="gd-status-sub">ticket #{g.ticketID}</span>
                </div>
            </div>

            {/* ══════════════════════════════════════
                STEPPER STRIP — full bleed
            ══════════════════════════════════════ */}
            <div className="gd-stepper-strip">
                <div className="gd-strip-label">
                    <Clock size={13} /> Tracking Status
                </div>
                <div className="status-stepper">
                    <div className="stepper-progress-track">
                        <div className="stepper-progress-fill" style={{ width: progressWidth }} />
                    </div>
                    {STEPS.map((step, i) => {
                        const isCompleted = i <= currentStep;
                        const isActive    = i === currentStep;
                        return (
                            <div
                                key={step.key}
                                className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            >
                                <div className="stepper-icon">
                                    {isCompleted
                                        ? <CheckCircle2 size={18} />
                                        : <span>{i + 1}</span>
                                    }
                                </div>
                                <span className="stepper-label">{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════
                TIMELINE STRIP — full bleed 3-col
            ══════════════════════════════════════ */}
            <div className="gd-timeline-strip">
                <div className="tl-date-item">
                    <span className="tl-label"><Calendar size={12} /> Submitted On</span>
                    <span className="tl-value">
                        {new Date(g.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                        })}
                    </span>
                </div>
                <div className="tl-date-item">
                    <span className="tl-label"><Clock size={12} /> Target Due Date</span>
                    <span className={`tl-value ${new Date() > new Date(g.dueAt) && g.status !== 'resolved' ? 'overdue' : ''}`}>
                        {g.dueAt
                            ? new Date(g.dueAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : 'Pending'}
                    </span>
                </div>
                <div className="tl-date-item">
                    <span className="tl-label"><CheckCircle2 size={12} /> Resolved On</span>
                    <span className="tl-value" style={{ color: g.resolvedAt ? 'var(--success)' : 'var(--text-muted)' }}>
                        {g.resolvedAt
                            ? new Date(g.resolvedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : '—'}
                    </span>
                </div>
            </div>

            {/* ══════════════════════════════════════
                BODY — main + sidebar
            ══════════════════════════════════════ */}
            <div className="gd-body">

                {/* ── Main column ── */}
                <main className="gd-main">

                    {/* Issue Details */}
                    <div className="gd-card">
                        <div className="gd-card-title"><Info size={14} /> Issue Details</div>
                        <p className="gd-desc" style={{ marginBottom: 20 }}>
                            {g.description || 'No description provided.'}
                        </p>
                        <div className="gd-info-grid">
                            <div className="gd-info-item">
                                <label>Location</label>
                                <span>
                                    {g.location
                                        ? `${g.location.buildingBlock || ''} · ${g.location.locationName || ''}`
                                        : 'Unknown location'}
                                </span>
                            </div>
                            <div className="gd-info-item">
                                <label>Category</label>
                                <span>{g.category || 'General'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Photo Evidence */}
                    {(g.initialPhoto || g.resolvedPhoto) && (
                        <div className="gd-card">
                            <div className="gd-card-title"><ImageIcon size={14} /> Photo Evidence</div>
                            <div className="gd-photos">
                                <div className="gd-photo-box">
                                    <label>Problem Photo</label>
                                    {g.initialPhoto
                                        ? <img
                                            className="gd-photo"
                                            src={g.initialPhoto}
                                            alt="Before"
                                            onClick={() => setPhotoModal(g.initialPhoto)}
                                          />
                                        : <div className="gd-no-photo">
                                            <ImageIcon size={20} /> Not uploaded
                                          </div>
                                    }
                                </div>
                                <div className="gd-photo-box">
                                    <label>Resolution Photo</label>
                                    {g.resolvedPhoto
                                        ? <img
                                            className="gd-photo"
                                            src={g.resolvedPhoto}
                                            alt="After"
                                            onClick={() => setPhotoModal(g.resolvedPhoto)}
                                          />
                                        : <div className="gd-no-photo">
                                            <ImageIcon size={20} /> Pending
                                          </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Feedback */}
                    {g.adminFeedback && (
                        <div className="gd-card">
                            <div className="gd-card-title"><FileText size={14} /> Admin Feedback</div>
                            <div className="gd-notes">{g.adminFeedback}</div>
                        </div>
                    )}

                </main>

                {/* ── Sidebar ── */}
                <aside className="gd-sidebar">

                    {/* Assigned Technician */}
                    {g.assignedContractor ? (
                        <div>
                            <p className="sidebar-section-title">Assigned Technician</p>
                            <div className="gd-contractor">
                                <div className="gd-contractor-avatar">
                                    {g.assignedContractor.name?.charAt(0)?.toUpperCase() || 'T'}
                                </div>
                                <div>
                                    <div className="gd-contractor-name">{g.assignedContractor.name}</div>
                                    {g.assignedContractor.specialization && (
                                        <div className="gd-contractor-spec">
                                            {g.assignedContractor.specialization}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {g.contractorNotes && (
                                <div style={{ marginTop: 14 }}>
                                    <p className="sidebar-section-title">
                                        <FileText size={11} style={{ display: 'inline', marginRight: 5 }} />
                                        Technician Notes
                                    </p>
                                    <div className="gd-notes">{g.contractorNotes}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="sidebar-section-title">Assigned Technician</p>
                            <div className="sidebar-info-card">
                                <strong>Pending Assignment</strong>
                                A technician will be auto-assigned based on location proximity once the ticket is reviewed.
                            </div>
                        </div>
                    )}

                    {/* Ticket meta summary */}
                    <div>
                        <p className="sidebar-section-title">Ticket Info</p>
                        <div className="sidebar-info-card">
                            <strong>How it works</strong>
                            The nearest contractor is automatically assigned based on their proximity to the reported location. Updates will reflect here in real time.
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    );
};

export default GrievanceDetail;