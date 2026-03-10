import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.svg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle">
              <img src={logo} alt="CampusCare Logo" className="logo-img" />
            </div>
            <h1 className="login-title">CampusCare</h1>
            <p className="login-subtitle">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <span className="label-icon">✉</span>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                className="form-input"
                disabled={isLoading}
                required
              />
              <div className="input-focus-border"></div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="input-focus-border"></div>
            </div>

            {error && (
              <div className="error-container">
                <div className="error-icon">⚠️</div>
                <p className="error-message">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`submit-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span className="button-icon">→</span>
                  Sign In
                </>
              )}
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="forgot-password">
              <a href="#forgot">Forgot your password?</a>
            </p>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              Protected by <strong>Advanced Security</strong>
            </p>
            <div className="security-badges">
              <span className="badge">🔐 SSL Encrypted</span>
              <span className="badge">✓ Verified</span>
            </div>
          </div>
        </div>

        <div className="login-side-info">
          <div className="info-card">
            <h3>About CampusCare Admin</h3>
            <p>
              Manage campus grievances, reports, and student care facilities
              efficiently. Access real-time analytics and administrative tools.
            </p>
          </div>
          <div className="info-card">
            <h3>Secure Access</h3>
            <p>
              Your account is protected with enterprise-grade security
              protocols. Login credentials are encrypted end-to-end.
            </p>
          </div>
        </div>
      </div>

      <div className="floating-elements">
        <div className="float float-1">💼</div>
        <div className="float float-2">📊</div>
        <div className="float float-3">🔒</div>
        <div className="float float-4">✨</div>
      </div>
    </div>
  );
};

export default Login;
