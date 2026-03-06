import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Signup   from './pages/Signup';
import CitizenDashboard  from './pages/citizen/Dashboard';
import GovtDashboard     from './pages/government/Dashboard';
import IndustryDashboard from './pages/industry/Dashboard';

function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'government') return <Navigate to="/government" replace />;
    if (user.role === 'industry')   return <Navigate to="/industry" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/citizen"    element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/government" element={<ProtectedRoute role="government"><GovtDashboard /></ProtectedRoute>} />
        <Route path="/industry"   element={<ProtectedRoute role="industry"><IndustryDashboard /></ProtectedRoute>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
