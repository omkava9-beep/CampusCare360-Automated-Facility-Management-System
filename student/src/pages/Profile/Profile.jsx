import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile, changePassword, fetchMyGrievances } from '../../redux/slices/studentSlice';
import { useAuth } from '../../hooks/useAuth';
import {
    User, Mail, Phone, Building2, ShieldCheck,
    Edit3, Save, X, Lock, LogOut, Eye, EyeOff, CheckCircle2, IdCard, GitPullRequest, ClipboardList, Clock
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, logout } = useAuth();
    const { profile, grievances = [], isLoading, error } = useSelector(s => s.student);

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ fName: '', midName: '', lastName: '', phoneNumber: '', email: '', department: '' });
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [pwSection, setPwSection] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);
    const [showPws, setShowPws] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        dispatch(fetchStudentProfile());
        dispatch(fetchMyGrievances({})); // Grab grievances for the history counts
    }, [dispatch]);

    useEffect(() => {
        const p = profile || user;
        if (p) {
            setForm({
                fName: p.fName || '',
                midName: p.midName || '',
                lastName: p.lastName || '',
                phoneNumber: p.phoneNumber || '',
                email: p.email || '',
                department: p.department || '',
            });
        }
    }, [profile, user]);

    const handleSave = async () => {
        const result = await dispatch(updateStudentProfile(form));
        if (updateStudentProfile.fulfilled.match(result)) {
            setEditMode(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const handlePwSubmit = async (e) => {
        e.preventDefault();
        setPwError('');
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('New password must be at least 6 characters.');
            return;
        }
        const result = await dispatch(changePassword({
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword
        }));
        if (changePassword.fulfilled.match(result)) {
            setPwSuccess(true);
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => { setPwSuccess(false); setPwSection(false); }, 3000);
        } else {
            setPwError(result.payload || 'Failed to change password.');
        }
    };

    const displayData = profile || user;

    const statusColors = { Active: '#3fb950', Suspended: '#f85149', Inactive: '#e3b341' };
    const statusColor = statusColors[displayData?.status] || '#8b949e';

    const renderId = (id) => id ? `STU-${id.substring(id.length - 6).toUpperCase()}` : '—';

    // Grievance Stats
    const totalGrievances = grievances.length;
    const resolvedGrievances = grievances.filter(g => g.status === 'resolved' || g.status === 'done').length;
    const pendingGrievances = totalGrievances - resolvedGrievances;

    return (
        <div className="profile-page page-enter">
            <div className="profile-container">

                {/* Profile Card */}
                <div className="profile-hero glass-panel">
                    <div className="ph-avatar">
                        {displayData?.profilePic
                            ? <img src={displayData.profilePic} alt="avatar" />
                            : <span>{displayData?.fName?.charAt(0)?.toUpperCase() || 'S'}</span>
                        }
                    </div>
                    <div className="ph-info">
                        <h1 className="ph-name">{displayData?.fName} {displayData?.midName ? `${displayData.midName} ` : ''}{displayData?.lastName}</h1>
                        <p className="ph-email">{displayData?.email}</p>
                        <div className="ph-badges">
                            <span className="ph-role">{displayData?.role === 'faculty' ? 'Faculty' : 'Student'}</span>
                            <span className="ph-status" style={{ color: statusColor, border: `1px solid ${statusColor}30`, background: `${statusColor}12` }}>
                                <span className="ps-dot" style={{ background: statusColor }} />
                                {displayData?.status}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`ph-edit-btn ${editMode ? 'cancel' : ''}`}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? <><X size={15} /> Cancel</> : <><Edit3 size={15} /> Edit</>}
                    </button>
                </div>

                {saveSuccess && (
                    <div className="profile-toast success">
                        <CheckCircle2 size={16} /> Profile updated successfully!
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {/* Personal Info */}
                    <div className="profile-card glass-panel" style={{ margin: 0 }}>
                        <div className="pc-title"><User size={15} /> Personal Information</div>
                        {editMode ? (
                            <div className="pc-edit-form">
                                <div className="pef-row">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input className="form-input" value={form.fName} onChange={e => setForm(p => ({...p, fName: e.target.value}))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input className="form-input" value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="pef-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-input" value={form.phoneNumber} onChange={e => setForm(p => ({...p, phoneNumber: e.target.value}))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="form-label">Department</label>
                                    <input className="form-input" value={form.department} onChange={e => setForm(p => ({...p, department: e.target.value}))} />
                                </div>
                                <button className="btn-primary profile-save-btn" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? <><div className="spinner-sm" /> Saving...</> : <><Save size={16} /> Save Contact Info</>}
                                </button>
                            </div>
                        ) : (
                            <div className="pc-fields">
                                {[
                                    { icon: User,      label: 'Full Name',   value: [displayData?.fName, displayData?.midName, displayData?.lastName].filter(Boolean).join(' ') || '—' },
                                    { icon: IdCard,    label: 'Student ID',  value: renderId(displayData?._id) },
                                    { icon: Mail,      label: 'Email',       value: displayData?.email || '—' },
                                    { icon: Phone,     label: 'Phone',       value: displayData?.phoneNumber || '—' },
                                    { icon: Building2, label: 'Department',  value: displayData?.department || '—' },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="pc-field">
                                        <div className="pcf-icon"><Icon size={15} /></div>
                                        <div>
                                            <span className="pcf-label">{label}</span>
                                            <span className="pcf-value">{value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Grievance History Stats */}
                    <div className="profile-card glass-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                        <div className="pc-title"><GitPullRequest size={15} /> Grievance History</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(56,139,253,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56,139,253,0.2)' }}>
                                <ClipboardList size={30} color="#388bfd" style={{ marginRight: '16px' }} />
                                <div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight:'1.2', color: '#fff' }}>{totalGrievances}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Total Submitted</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, background: 'rgba(63,185,80,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(63,185,80,0.2)' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3fb950', marginBottom: '4px' }}><CheckCircle2 size={16} style={{ display: 'inline', transform: 'translateY(2px)' }} /> {resolvedGrievances}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Resolved</div>
                                </div>
                                <div style={{ flex: 1, background: 'rgba(227,179,65,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(227,179,65,0.2)' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#e3b341', marginBottom: '4px' }}><Clock size={16} style={{ display: 'inline', transform: 'translateY(2px)' }} /> {pendingGrievances}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="profile-card glass-panel" style={{ marginTop: '16px' }}>
                    <div className="pc-title pc-title-toggle" onClick={() => setPwSection(!pwSection)}>
                        <Lock size={15} /> Change Password
                        <span className="pc-toggle-arrow" style={{ transform: pwSection ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>
                    {pwSection && (
                        <form className="pc-edit-form" onSubmit={handlePwSubmit}>
                            {pwError && <div className="profile-error">{pwError}</div>}
                            {pwSuccess && <div className="profile-toast success" style={{ margin: '0 0 12px' }}><CheckCircle2 size={14} /> Password changed successfully!</div>}
                            {[
                                { key: 'currentPassword', label: 'Current Password', pwKey: 'current' },
                                { key: 'newPassword',     label: 'New Password',     pwKey: 'new' },
                                { key: 'confirmPassword', label: 'Confirm New Password', pwKey: 'confirm' },
                            ].map(({ key, label, pwKey }) => (
                                <div className="form-group" key={key}>
                                    <label className="form-label">{label}</label>
                                    <div className="password-wrap">
                                        <input
                                            className="form-input"
                                            type={showPws[pwKey] ? 'text' : 'password'}
                                            value={pwForm[key]}
                                            onChange={e => setPwForm(p => ({...p, [key]: e.target.value}))}
                                            required
                                        />
                                        <button type="button" className="pw-toggle" onClick={() => setShowPws(p => ({...p, [pwKey]: !p[pwKey]}))}>
                                            {showPws[pwKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button className="btn-primary profile-save-btn" type="submit" disabled={isLoading}>
                                {isLoading ? <><div className="spinner-sm" /> Updating...</> : <><Lock size={15} /> Update Password</>}
                            </button>
                        </form>
                    )}
                </div>

                {/* Account Status / Log Out Box */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '30px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck size={20} color={statusColor} />
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>Account {displayData?.status}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standing in good validation</div>
                        </div>
                    </div>
                    <button className="btn-danger profile-logout" onClick={() => logout()} style={{ margin: 0, padding: '8px 16px', background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
