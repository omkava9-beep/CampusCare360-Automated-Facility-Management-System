import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, updateStudentStatus, registerStudent } from '../../redux/slices/studentSlice';
import { UserCheck, GraduationCap, X, UserPlus, Mail, ShieldAlert, User, ShieldCheck, UserCog } from 'lucide-react';
import '../Contractors/DirectoryStyles.css';

const Students = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.students);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleStatusChange = (userId, newState) => {
    dispatch(updateStudentStatus({ userId, newState }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerStudent(formData));
    if (registerStudent.fulfilled.match(result)) {
        setShowModal(false);
        setFormData({ fName: '', lastName: '', email: '', password: '' });
    }
  };

  return (
    <div className="directory-container page-container">
      {/* Background Orbs */}
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(163, 113, 247, 0.08) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.08) 0%, transparent 70%)' }}></div>
      </div>

      <header className="directory-header">
        <div>
            <h1 className="page-title">Campus Residents</h1>
            <p className="page-subtitle">Unified directory for student verification and facility access management.</p>
        </div>
        
        <button className="primary-button shiny-btn" onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            Onboard Student
        </button>
      </header>

      {isLoading ? (
        <div className="loading-container" style={{ padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Accessing resident records...</p>
        </div>
      ) : (
        <div className="directory-table-wrapper glass-panel">
          <div className="table-header-premium">
             <GraduationCap size={20} color="var(--accent-primary)" />
             <h3>Authorized Residents</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="directory-table">
                <thead>
                <tr>
                    <th>Resident</th>
                    <th>Academic Contact</th>
                    <th>Global Status</th>
                    <th>Management</th>
                </tr>
                </thead>
                <tbody>
                {list.map((student) => (
                    <tr key={student._id}>
                    <td>
                        <div className="personnel-cell">
                            <div className="personnel-avatar" style={{ background: 'linear-gradient(135deg, #a371f7 0%, #388bfd 100%)' }}>
                                {student.fName[0]}{student.lastName[0]}
                            </div>
                            <span className="personnel-name">{`${student.fName} ${student.lastName}`}</span>
                        </div>
                    </td>
                    <td>{student.email}</td>
                    <td>
                        <span className={`status-badge ${student.status?.toLowerCase()}`}>
                        {student.status}
                        </span>
                    </td>
                    <td>
                        <div className="management-actions">
                        <select 
                            value={student.status} 
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                            className="status-dropdown"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                        <button 
                            className="action-icon-btn"
                            title="Review Dossier"
                        >
                            <UserCog size={16} />
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
                <p>No student footprints detected in the current zone.</p>
            </div>
          )}
        </div>
      )}

      {/* Premium Onboarding Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content glass-panel" style={{ maxWidth: '600px', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ padding: '24px 32px' }}>
                    <div className="header-text-group">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Security Clearance
                        </span>
                        <h2 className="modal-title" style={{ fontSize: '1.5rem', marginTop: '4px' }}>Secure Onboarding</h2>
                    </div>
                    <button className="close-modal" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleRegister} className="modal-form" style={{ padding: '0 32px 32px' }}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                <UserCheck size={14} /> First Name
                            </label>
                            <input 
                                className="glass-panel"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                                type="text" 
                                placeholder="e.g. John"
                                value={formData.fName}
                                onChange={(e) => setFormData({...formData, fName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Last Name</label>
                            <input 
                                className="glass-panel"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                                type="text" 
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Mail size={14} /> Academic Email
                        </label>
                        <input 
                            className="glass-panel"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                            type="email" 
                            placeholder="student@campus.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <ShieldAlert size={14} /> Access Password
                        </label>
                        <input 
                            className="glass-panel"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                            type="password" 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-button shiny-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '32px', padding: '14px' }}>
                        Confirm Registration
                    </button>
                </form>
            </div>
        </div>
      )}

      <style jsx="true">{`
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
            border: 3px solid rgba(163, 113, 247, 0.1);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Students;
