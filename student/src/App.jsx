import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Submit from './pages/Submit/Submit';
import GrievanceList from './pages/Grievances/GrievanceList';
import GrievanceDetail from './pages/Grievances/GrievanceDetail';
import Profile from './pages/Profile/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.student);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the ?qr param when redirecting to login
    return <Navigate to={`/login${location.search}`} replace />;
  }

  // Already logged in + QR param present on the root path → go straight to submit
  const qr = new URLSearchParams(location.search).get('qr');
  if (qr && location.pathname === '/') {
    return <Navigate to={`/submit?qr=${qr}`} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="submit" element={<Submit />} />
        <Route path="tickets" element={<GrievanceList />} />
        <Route path="tickets/:id" element={<GrievanceDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
