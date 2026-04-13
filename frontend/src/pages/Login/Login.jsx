import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '../../assets/PPSUNAACA+Logo.png';
import './Login.css';
import { Navigate, useNavigate } from 'react-router';
import Dashboard from '../Dashboard/Dashboard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
        // Redirect will be handled by App.jsx or Router
        console.log('Contractor Authenticated');
        navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <div className="login-bg-decor">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="icon-wrapper">
             <img src={logo} alt="Logo" className="brand-icon-img" />
          </div>
          <p className="subtitle">Contractor Service Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="field-icon" />
              <input 
                type="email" 
                placeholder="contractor@campus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="field-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : <LogIn size={18} />}
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p><ShieldCheck size={14} /> Secured Terminal Access</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
