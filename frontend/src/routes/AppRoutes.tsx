// AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Violations from '../pages/Violations';
import Analytics from '../pages/Analytics';
import Offenders from '../pages/Offenders';
import Reports from '../pages/Reports';
import Heatmap from '../pages/Heatmap';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/violations" element={<ProtectedRoute><Violations /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/offenders" element={<ProtectedRoute><Offenders /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
