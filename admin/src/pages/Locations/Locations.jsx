import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations, createLocation } from '../../redux/slices/locationSlice';
import { MapPin, Plus, QrCode, Download, X, Building, Layers, Map as MapIcon, Globe, Navigation, ShieldAlert, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './Locations.css';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// College Geofence Settings
const COLLEGE_CENTER = [21.4988, 73.0081]; // P.P. Savani University
const GEOFENCE_RADIUS = 500; // 500 meters radius from center

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            const distance = L.latLng(COLLEGE_CENTER).distanceTo([lat, lng]);
            
            if (distance <= GEOFENCE_RADIUS) {
                setPosition({ lat, lng });
            } else {
                alert("Please select a location within the college campus boundary!");
            }
        },
    });

    return position.lat && position.lng ? <Marker position={[position.lat, position.lng]} /> : null;
};

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        // Trigger resize on multiple intervals to ensure it catches when the modal is fully transitioned
        const resizeIntervals = [100, 300, 600, 1000];
        resizeIntervals.forEach(delay => {
            setTimeout(() => {
                map.invalidateSize();
            }, delay);
        });
    }, [map]);
    return null;
};

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
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/user/admin/downloadqr/${locationId}`;
  };

  return (
    <div className="locations-container page-container">
      {/* Background Orbs */}
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.1) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(163, 113, 247, 0.05) 0%, transparent 70%)' }}></div>
      </div>

      <header className="locations-header">
        <div>
            <h1 className="page-title">Reporting Points</h1>
            <p className="page-subtitle">Manage campus geolocation triggers and maintenance QR code anchors.</p>
        </div>
        
        <button className="primary-button shiny-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Initialize Location
        </button>
      </header>

      {isLoading ? (
        <div className="loading-container" style={{ padding: '100px 0' }}>
            <div className="spinner"></div>
            <p>Syncing geographic coordinates...</p>
        </div>
      ) : (
        <div className="locations-table-wrapper glass-panel">
          <div className="table-header-premium">
             <MapIcon size={20} color="var(--accent-primary)" />
             <h3>Active Geozones</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="locations-table">
                <thead>
                <tr>
                    <th>Location Node</th>
                    <th>Building/Zone</th>
                    <th>Floor/Level</th>
                    <th>Coordinates</th>
                    <th>Priority</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {list.map((loc) => (
                    <tr key={loc._id}>
                    <td>
                        <div className="node-cell">
                            <div className="node-icon-wrapper">
                                <MapPin size={16} />
                            </div>
                            <span className="node-name">{loc.locationName}</span>
                        </div>
                    </td>
                    <td>{loc.buildingBlock}</td>
                    <td>
                        <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                            LVL {loc.floorNumber}
                        </code>
                    </td>
                    <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                           {loc.coordinates?.coordinates ? (
                               <>
                                   {loc.coordinates.coordinates[1]?.toFixed(4)}, {loc.coordinates.coordinates[0]?.toFixed(4)}
                               </>
                           ) : (
                               'N/A'
                           )}
                        </div>
                    </td>
                    <td>
                        <span className={`priority-chip ${loc.isHighPriorityZone ? 'priority-high' : 'priority-normal'}`}>
                        {loc.isHighPriorityZone ? 'CRITICAL' : 'STANDARD'}
                        </span>
                    </td>
                    <td>
                        <button className="qr-download-btn" onClick={() => handleDownloadQR(loc._id)}>
                            <Download size={14} />
                            QR Anchor
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {list.length === 0 && (
            <div className="no-data" style={{ padding: '60px', textAlign: 'center' }}>
                <Globe size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '16px' }} />
                <p>No reporting nodes discovered in this sector.</p>
            </div>
          )}
        </div>
      )}

      {/* Modern Location Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content glass-panel" style={{ maxWidth: '600px', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ padding: '24px 32px' }}>
                    <div className="header-text-group">
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Infrastructure
                        </span>
                        <h2 className="modal-title" style={{ fontSize: '1.5rem', marginTop: '4px' }}>Initialize Node</h2>
                    </div>
                    <button className="close-modal" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleCreate} className="modal-form" style={{ padding: '0 32px 32px' }}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Navigation size={14} /> Node Identifier
                        </label>
                        <input 
                            className="glass-panel"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                            type="text" 
                            placeholder="e.g. Science Wing Corridor B"
                            value={formData.locationName}
                            onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row-premium">
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                <Building size={14} /> Building
                            </label>
                            <input 
                                className="glass-panel input-premium"
                                type="text" 
                                placeholder="Block A"
                                value={formData.buildingBlock}
                                onChange={(e) => setFormData({...formData, buildingBlock: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                <Layers size={14} /> Floor
                            </label>
                            <input 
                                className="glass-panel input-premium"
                                type="number" 
                                placeholder="0"
                                value={formData.floorNumber}
                                onChange={(e) => setFormData({...formData, floorNumber: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Geofencing Map Selection */}
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Target size={14} /> Geospatial Placement
                        </label>
                        <div className="map-selection-container">
                            <MapContainer 
                                center={COLLEGE_CENTER} 
                                zoom={18} 
                                style={{ height: '250px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                />
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                    opacity={0.8}
                                />
                                <Circle 
                                    center={COLLEGE_CENTER} 
                                    radius={GEOFENCE_RADIUS}
                                    pathOptions={{ color: '#388bfd', fillColor: '#388bfd', fillOpacity: 0.1 }}
                                />
                                <LocationPicker 
                                    position={{ lat: formData.latitude, lng: formData.longitude }} 
                                    setPosition={(pos) => setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))} 
                                />
                                <MapResizer />
                            </MapContainer>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                            Click on the map to drop a pin. Must be within P.P. Savani University campus.
                        </p>
                    </div>

                    <div className="form-row-premium">
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Latitude</label>
                            <input 
                                className="glass-panel input-premium"
                                type="number" 
                                step="any"
                                placeholder="21.4988"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Longitude</label>
                            <input 
                                className="glass-panel input-premium"
                                type="number" 
                                step="any"
                                placeholder="73.0081"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input 
                            type="checkbox" 
                            id="priority"
                            checked={formData.isHighPriorityZone}
                            onChange={(e) => setFormData({...formData, isHighPriorityZone: e.target.checked})}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="priority" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={16} color={formData.isHighPriorityZone ? "var(--error)" : "var(--text-muted)"} />
                            Elevate to High Priority Zone
                        </label>
                    </div>

                    <button type="submit" className="primary-button shiny-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '32px', padding: '14px' }}>
                        <QrCode size={18} style={{ marginRight: '8px' }} />
                        Deploy Secure QR Anchor
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
            border: 3px solid rgba(56, 139, 253, 0.1);
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

export default Locations;
