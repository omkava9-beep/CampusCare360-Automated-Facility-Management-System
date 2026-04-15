import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { submitGrievance, fetchLocation, clearSubmitSuccess } from '../../redux/slices/studentSlice';
import {
    MapPin, Upload, CheckCircle2, PlusCircle, X,
    Image as ImageIcon, AlertCircle, FileText
} from 'lucide-react';
import './Submit.css';

const CATEGORIES = [
    'Electrical', 'Plumbing', 'Cleaning', 'Furniture',
    'IT & Network', 'Security', 'Civil', 'Other'
];

const PRIORITIES = [
    { value: 'Low',    label: 'Low',    desc: 'Non-urgent, can wait',    color: '#34d399' },
    { value: 'Medium', label: 'Medium', desc: 'Should be fixed soon',    color: '#fbbf24' },
    { value: 'High',   label: 'High',   desc: 'Urgent — affects safety', color: '#f87171' },
];

const Submit = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrLocationId = searchParams.get('qr');

    const { isLoading, error, submitSuccess, currentLocation } = useSelector(s => s.student);

    const [form, setForm] = useState({
        subject: '', description: '', category: '', priority: 'Medium',
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [locationId, setLocationId] = useState(qrLocationId || '');

    useEffect(() => {
        if (qrLocationId) {
            setLocationId(qrLocationId);
            dispatch(fetchLocation(qrLocationId));
        }
    }, [qrLocationId, dispatch]);

    useEffect(() => {
        return () => dispatch(clearSubmitSuccess());
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => { setPhoto(null); setPhotoPreview(null); };

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!locationId) {
            alert('Please scan a QR code at a campus location to submit a report.');
            return;
        }
        const payload = {
            subject: form.subject,
            description: form.description,
            category: form.category || 'Other',
            priority: form.priority,
            qrCodeLocationId: locationId,
            photo: photo
        };
        await dispatch(submitGrievance(payload));
    };

    /* ── Success screen ── */
    if (submitSuccess) {
        return (
            <div className="submit-success page-enter">
                <div className="ss-card glass-panel">
                    <div className="ss-icon">
                        <CheckCircle2 size={36} strokeWidth={2} />
                    </div>
                    <h2>Report Submitted!</h2>
                    <p>Your issue has been recorded and the nearest technician will be assigned automatically.</p>
                    {submitSuccess.grievance?.ticketID && (
                        <div className="ss-ticket">
                            <span className="ss-ticket-label">Ticket ID</span>
                            <span className="ss-ticket-id">{submitSuccess.grievance.ticketID}</span>
                        </div>
                    )}
                    <div className="ss-actions">
                        <button
                            className="btn-primary"
                            onClick={() => { dispatch(clearSubmitSuccess()); navigate('/tickets'); }}
                        >
                            View My Tickets
                        </button>
                        <button className="btn-ghost" onClick={() => dispatch(clearSubmitSuccess())}>
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Main form ── */
    return (
        <div className="submit-page page-enter">
            <div className="submit-container">

                {/* Header */}
                <div className="submit-header">
                    <h1>Report an <span>Issue</span></h1>
                    <p>Describe the problem clearly so our team can resolve it as quickly as possible.</p>
                </div>

                {/* Location bar */}
                <div className={`submit-location-bar ${locationId ? 'has-location' : 'no-location'}`}>
                    <MapPin size={15} />
                    {locationId && currentLocation ? (
                        <span>
                            <strong>{currentLocation.buildingBlock}</strong>
                            {' · '}{currentLocation.locationName}
                            {currentLocation.floorNumber ? ` · Floor ${currentLocation.floorNumber}` : ''}
                        </span>
                    ) : locationId ? (
                        <span>Location detected from QR scan</span>
                    ) : (
                        <span>No location detected — please scan a campus QR code first.</span>
                    )}
                </div>

                {/* Error banner */}
                {error && (
                    <div className="submit-error">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                {/* Form card */}
                <form className="submit-form" onSubmit={handleSubmit}>

                    {/* Subject */}
                    <div className="form-group">
                        <label className="form-label">
                            Issue Title <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <input
                            className="form-input"
                            placeholder="e.g., Broken ceiling light in corridor B-101"
                            value={form.subject}
                            onChange={e => handleChange('subject', e.target.value)}
                            required
                            maxLength={120}
                        />
                    </div>

                    {/* Category + Priority */}
                    <div className="submit-row">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                value={form.category}
                                onChange={e => handleChange('category', e.target.value)}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <div className="priority-selector">
                                {PRIORITIES.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        className={`priority-opt ${form.priority === p.value ? 'selected' : ''}`}
                                        style={{ '--p-color': p.color }}
                                        onClick={() => handleChange('priority', p.value)}
                                        title={p.desc}
                                    >
                                        <span className="po-dot" />
                                        <span>{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">
                            Description <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <textarea
                            className="form-textarea"
                            rows={5}
                            placeholder="Describe the problem in detail — what happened, where exactly, and since when..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            required
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="form-group">
                        <label className="form-label">
                            Photo Evidence{' '}
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                                (optional)
                            </span>
                        </label>
                        {photoPreview ? (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="Preview" />
                                <button type="button" className="photo-remove" onClick={removePhoto}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="photo-upload-box"
                                onClick={() => document.getElementById('submit-photo').click()}
                            >
                                <ImageIcon size={26} style={{ opacity: 0.35 }} />
                                <p>Click to upload a photo</p>
                                <span>JPG, PNG · Max 5MB</span>
                            </div>
                        )}
                        <input
                            id="submit-photo"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handlePhotoChange}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        className="submit-btn"
                        type="submit"
                        disabled={isLoading || !locationId}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner-sm" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <PlusCircle size={17} strokeWidth={2.5} />
                                Submit Report
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Submit;