import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations, createLocation } from '../../redux/slices/locationSlice';
import { MapPin, Plus, QrCode, Download, X, Building, Layers, Map as MapIcon } from 'lucide-react';

const Locations = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.locations);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    locationName: '',
    buildingBlock: '',
    floorNumber: '',
    latitude: '',
    longitude: '',
    isHighPriorityZone: false
  });

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createLocation({
        ...formData,
        floorNumber: parseInt(formData.floorNumber),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
    }));
    if (createLocation.fulfilled.match(result)) {
        setShowModal(false);
        setFormData({ locationName: '', buildingBlock: '', floorNumber: '', latitude: '', longitude: '', isHighPriorityZone: false });
    }
  };

  const handleDownloadQR = (locationId) => {
    window.location.href = `http://localhost:4000/api/v1/user/admin/downloadqr/${locationId}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reporting Points</h1>
        <p className="page-subtitle">Manage campus geolocation triggers and maintenance QR code anchors.</p>
        
        <div className="action-bar">
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Initialize Location
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Syncing geographic coordinates...</div>
      ) : (
        <div className="data-table-container glass-panel">
          <div className="table-header-box">
             <MapIcon size={20} color="#388bfd" />
             <h3>Active Geozones</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Location Node</th>
                <th>Building/Zone</th>
                <th>Floor/Level</th>
                <th>Priority</th>
                <th>Anchors</th>
              </tr>
            </thead>
            <tbody>
              {list.map((loc) => (
                <tr key={loc._id}>
                  <td>
                    <div className="user-info-cell">
                        <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg, #388bfd 0%, #79c0ff 100%)' }}>
                            <MapPin size={14} />
                        </div>
                        <span className="user-fullname">{loc.locationName}</span>
                    </div>
                  </td>
                  <td>{loc.buildingBlock}</td>
                  <td>
                    <code className="expertise-tag">LVL {loc.floorNumber}</code>
                  </td>
                  <td>
                    <span className={`status-badge ${loc.isHighPriorityZone ? 'suspended' : 'active'}`}>
                      {loc.isHighPriorityZone ? 'HIGH CRITICALITY' : 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <button className="status-select" onClick={() => handleDownloadQR(loc._id)}>
                        <Download size={14} style={{ marginRight: '6px' }} />
                        Download QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <div className="no-data">No reporting nodes discovered in this sector.</div>}
        </div>
      )}

      {/* Location Modal */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <Building size={24} color="#388bfd" />
                    <h2>Project Alpha Node</h2>
                    <button className="close-modal" onClick={() => setShowModal(false)}><X size={20}/></button>
                </div>
                <form onSubmit={handleCreate} className="modal-form">
                    <div className="form-group">
                        <label><MapPin size={14} /> Node Identifier</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Science Wing Corridor B"
                            value={formData.locationName}
                            onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label><Building size={14} /> Building</label>
                            <input 
                                type="text" 
                                placeholder="Block A"
                                value={formData.buildingBlock}
                                onChange={(e) => setFormData({...formData, buildingBlock: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Layers size={14} /> Floor</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={formData.floorNumber}
                                onChange={(e) => setFormData({...formData, floorNumber: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Latitude</label>
                            <input 
                                type="number" 
                                step="any"
                                placeholder="28.1234"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Longitude</label>
                            <input 
                                type="number" 
                                step="any"
                                placeholder="77.1234"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="priority"
                            checked={formData.isHighPriorityZone}
                            onChange={(e) => setFormData({...formData, isHighPriorityZone: e.target.checked})}
                        />
                        <label htmlFor="priority">High Priority Maintenance Zone</label>
                    </div>
                    <button type="submit" className="primary-button full-width">
                        <QrCode size={18} style={{ marginRight: '8px' }} />
                        Generate Secure QR
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
