import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, updateStudentStatus, registerStudent } from '../../redux/slices/studentSlice';
import { UserCheck, GraduationCap, X, UserPlus, Mail, ShieldAlert } from 'lucide-react';

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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campus Residents</h1>
        <p className="page-subtitle">Unified directory for student verification and facility access management.</p>
        
        <div className="action-bar">
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            Onboard Student
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Retrieving encryption-secured records...</div>
      ) : (
        <div className="data-table-container glass-panel">
          <div className="table-header-box">
             <GraduationCap size={20} color="#388bfd" />
             <h3>Authorized Students</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Academic Contact</th>
                <th>Global Status</th>
                <th>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {list.map((student) => (
                <tr key={student._id}>
                  <td>
                    <div className="user-info-cell">
                        <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg, #a371f7 0%, #388bfd 100%)' }}>
                            {student.fName[0]}{student.lastName[0]}
                        </div>
                        <span className="user-fullname">{`${student.fName} ${student.lastName}`}</span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <span className={`status-badge ${student.status?.toLowerCase()}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={student.status} 
                      onChange={(e) => handleStatusChange(student._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <div className="no-data">No student footprints detected in the current zone.</div>}
        </div>
      )}

      {/* Premium Onboarding Modal */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <UserPlus size={24} color="#388bfd" />
                    <h2>Secure Onboarding</h2>
                    <button className="close-modal" onClick={() => setShowModal(false)}><X size={20}/></button>
                </div>
                <form onSubmit={handleRegister} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label><UserCheck size={14} /> First Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. John"
                                value={formData.fName}
                                onChange={(e) => setFormData({...formData, fName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label><Mail size={14} /> Academic Email</label>
                        <input 
                            type="email" 
                            placeholder="student@campus.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><ShieldAlert size={14} /> Access Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="primary-button full-width">
                        Confirm Registration
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Students;
