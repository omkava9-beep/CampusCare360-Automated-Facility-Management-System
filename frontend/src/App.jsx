import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import GrievanceList from './pages/Grievances/GrievanceList';
import GrievanceDetail from './pages/Grievances/GrievanceDetail';
import Profile from './pages/Profile/Profile';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="full-loader">Verifying Terminal...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Dashboard is the shell — always rendered. DashboardHome is embedded inside it. */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
        <Route path="grievances"     element={<GrievanceList />} />
        <Route path="grievances/:id" element={<GrievanceDetail />} />
        <Route path="history"        element={<GrievanceList filter="history" />} />
        <Route path="profile"        element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
