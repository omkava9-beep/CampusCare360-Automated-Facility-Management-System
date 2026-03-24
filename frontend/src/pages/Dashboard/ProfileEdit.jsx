import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Shield, Save, X } from 'lucide-react';
import { updateContractorProfile } from '../../redux/slices/contractorSlice';
import './Profile.css';

const ProfileEdit = ({ onClose }) => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        fName: user?.fName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        specialization: user?.specialization || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateContractorProfile(formData));
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label><User size={14} /> First Name</label>
                            <input 
                                type="text" 
                                value={formData.fName}
                                onChange={(e) => setFormData({...formData, fName: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label><User size={14} /> Last Name</label>
                            <input 
                                type="text" 
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label><Phone size={14} /> Phone</label>
                            <input 
                                type="text" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label><Shield size={14} /> Specialization</label>
                            <input 
                                type="text" 
                                value={formData.specialization}
                                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary"><Save size={18} /> Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;
