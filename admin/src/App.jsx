import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Grievances from './pages/Grievances/Grievances';
import Contractors from './pages/Contractors/Contractors';
import Students from './pages/Students/Students';
import Locations from './pages/Locations/Locations';
import Approvals from './pages/Approvals/Approvals';
import Settings from './pages/Settings/Settings';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
        
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="grievances" element={<Grievances />} />
          <Route path="locations" element={<Locations />} />
          <Route path="contractors" element={<Contractors />} />
          <Route path="students" element={<Students />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
