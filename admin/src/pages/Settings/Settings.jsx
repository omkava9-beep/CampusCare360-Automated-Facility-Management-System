import { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Monitor, 
  Settings as SettingsIcon, 
  Lock, 
  Globe, 
  Zap, 
  Database,
  Save
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproval, setAutoApproval] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const SettingToggle = ({ label, description, active, onToggle }) => (
    <div className="settings-item">
      <div className="settings-item-header">
        <div className="settings-item-info">
          <h4>{label}</h4>
          <p>{description}</p>
        </div>
        <div 
          className={`toggle-switch ${active ? 'active' : ''}`} 
          onClick={() => onToggle(!active)}
        >
          <div className="toggle-circle"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-container page-container">
      {/* Background Orbs */}
      <div className="dashboard-background">
        <div className="orb orb-1" style={{ background: 'radial-gradient(circle, rgba(56, 139, 253, 0.08) 0%, transparent 70%)' }}></div>
        <div className="orb orb-2" style={{ background: 'radial-gradient(circle, rgba(163, 113, 247, 0.08) 0%, transparent 70%)' }}></div>
      </div>

      <header className="settings-header">
        <h1 className="page-title">Administrative Settings</h1>
        <p className="page-subtitle">Configure system parameters, security protocols, and administrative preferences.</p>
      </header>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <User size={24} />
            </div>
            <div className="settings-card-title">
              <h3>Admin Profile</h3>
              <p>Personal account information</p>
            </div>
          </div>
          <div className="settings-content">
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Display Name</label>
              <input type="text" className="settings-input" defaultValue="Super Administrator" />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Email</label>
              <input type="email" className="settings-input" defaultValue="admin@campuscare.edu" />
            </div>
            <button className="primary-button shiny-btn" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

        {/* System Config Card */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'rgba(227, 179, 65, 0.1)', color: '#e3b341' }}>
              <Zap size={24} />
            </div>
            <div className="settings-card-title">
              <h3>System Control</h3>
              <p>Core application parameters</p>
            </div>
          </div>
          <div className="settings-content">
            <SettingToggle 
              label="Maintenance Mode" 
              description="Disable public access for updates"
              active={maintenanceMode}
              onToggle={setMaintenanceMode}
            />
            <SettingToggle 
              label="Grievance Auto-Approval" 
              description="Automatically route low-priority tasks"
              active={autoApproval}
              onToggle={setAutoApproval}
            />
            <div className="settings-item">
              <div className="settings-item-info">
                <h4>Data Sync Interval</h4>
                <p>Refresh rate for real-time dashboards</p>
              </div>
              <select className="settings-input" style={{ width: 'auto', background: 'rgba(255,255,255,0.05)' }}>
                <option>30 Seconds</option>
                <option>1 Minute</option>
                <option>5 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149' }}>
              <Shield size={24} />
            </div>
            <div className="settings-card-title">
              <h3>Security & Privacy</h3>
              <p>Access control & encryption</p>
            </div>
          </div>
          <div className="settings-content">
            <div className="settings-item">
                <div className="settings-item-header">
                    <div className="settings-item-info">
                        <h4>Administrative Password</h4>
                        <p>Last changed 14 days ago</p>
                    </div>
                    <button className="secondary-button" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Update</button>
                </div>
            </div>
            <div className="settings-item">
                <div className="settings-item-header">
                    <div className="settings-item-info">
                        <h4>Session Timeout</h4>
                        <p>Automatic logout after inactivity</p>
                    </div>
                    <select className="settings-input" style={{ width: 'auto', background: 'rgba(255,255,255,0.05)' }}>
                        <option>30 Mins</option>
                        <option>1 Hour</option>
                        <option>4 Hours</option>
                    </select>
                </div>
            </div>
            <div className="settings-item">
                <div className="settings-item-header">
                    <div className="settings-item-info">
                        <h4>Two-Factor Auth</h4>
                        <p>Recommended for root admins</p>
                    </div>
                    <div className="toggle-switch active">
                        <div className="toggle-circle"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'rgba(163, 113, 247, 0.1)', color: '#a371f7' }}>
              <Bell size={24} />
            </div>
            <div className="settings-card-title">
              <h3>Communications</h3>
              <p>Alerts & notification routing</p>
            </div>
          </div>
          <div className="settings-content">
            <SettingToggle 
              label="Real-time Push Alerts" 
              description="Popups for emergency grievances"
              active={pushNotifications}
              onToggle={setPushNotifications}
            />
            <SettingToggle 
              label="Weekly Analytics Email" 
              description="Detailed performance reporting"
              active={emailAlerts}
              onToggle={setEmailAlerts}
            />
            <div className="settings-item">
                <div className="settings-item-info">
                    <h4>Regional Timezone</h4>
                    <p>Standard data timestamping</p>
                </div>
                <select className="settings-input" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}>
                    <option>GMT +05:30 (Mumbai, Kolkata)</option>
                    <option>UTC (Global Standard)</option>
                    <option>GMT -05:00 (EST)</option>
                </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
