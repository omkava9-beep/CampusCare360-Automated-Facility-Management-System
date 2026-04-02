import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStudent, fetchLocation } from '../../redux/slices/studentSlice';
import { MapPin, Eye, EyeOff, LogIn, Building2 } from 'lucide-react';
import './Login.css';

const FEATURES = [
    'Scan any campus QR code to instantly report an issue',
    'Nearest contractor auto-assigned via geolocation',
    'Real-time status tracking for every ticket',
    'Photo evidence upload for faster resolution',
];

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrLocationId = searchParams.get('qr');

    const { isLoading, error, isAuthenticated } = useSelector(s => s.student);
    const currentLocation = useSelector(s => s.student.currentLocation);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(qrLocationId ? `/submit?qr=${qrLocationId}` : '/', { replace: true });
        }
    }, [isAuthenticated, qrLocationId, navigate]);

    useEffect(() => {
        if (qrLocationId) dispatch(fetchLocation(qrLocationId));
    }, [qrLocationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginStudent({ email, password }));
        if (loginStudent.fulfilled.match(result) && qrLocationId) {
            localStorage.setItem(`student_session_${qrLocationId}`, JSON.stringify({
                token: result.payload.token,
                user: result.payload.user,
                savedAt: Date.now(),
            }));
        }
    };

    return (
        <div className="login-page">

            {/* ── LEFT — branding panel ── */}
            <div className="login-left">
                <div className="login-orb login-orb-1" aria-hidden />
                <div className="login-orb login-orb-2" aria-hidden />

                {/* Brand */}
                <div className="login-brand">
                    <div className="login-logo">C</div>
                    <div>
                        <h1 className="login-title">CampusCare</h1>
                        <p className="login-subtitle">Student Facility Portal</p>
                    </div>
                </div>

                {/* Hero copy */}
                <div className="login-hero-text">
                    <h2>
                        Report campus<br />
                        issues <em>instantly</em>
                    </h2>
                    <p>
                        Scan a QR code anywhere on campus — classrooms, labs, corridors —
                        and report a problem in under 60 seconds. We'll handle the rest.
                    </p>
                </div>

                {/* Feature list */}
                <div className="login-features">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="login-feature">
                            <span className="lf-dot" />
                            {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT — form panel ── */}
            <div className="login-right">
                <div className="login-form-wrap">

                    <h2 className="login-heading">Welcome back</h2>
                    <p className="login-desc">Sign in with your institute credentials to continue.</p>

                    {/* QR location context */}
                    {qrLocationId && (
                        <div className="login-location-banner">
                            <div className="llb-icon">
                                <MapPin size={15} />
                            </div>
                            <div>
                                {currentLocation ? (
                                    <>
                                        <p className="llb-label">Scanning from</p>
                                        <p className="llb-location">
                                            <Building2 size={11} />
                                            {currentLocation.buildingBlock} · {currentLocation.locationName}
                                            {currentLocation.floorNumber
                                                ? ` · Floor ${currentLocation.floorNumber}`
                                                : ''}
                                        </p>
                                    </>
                                ) : (
                                    <p className="llb-label">Campus location detected — sign in to report</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="login-error">⚠ {error}</div>
                    )}

                    {/* Form */}
                    <form className="login-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="you@university.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-wrap">
                                <input
                                    className="form-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPassword(p => !p)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="login-btn"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner-sm" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} strokeWidth={2.5} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>

                    </form>

                    <p className="login-footer-note">
                        Having trouble? Contact your campus IT administrator.
                    </p>

                </div>
            </div>

        </div>
    );
};

export default Login;