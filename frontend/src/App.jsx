import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UserDashboard from './pages/user/UserDashboard';
import MyDevices from './pages/user/MyDevices'; // Assumed renamed SessionsPage
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuspicious from './pages/admin/AdminSuspicious';
import AdminSessions from './pages/admin/AdminSessions';
import AdminLogs from './pages/admin/AdminLogs';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* User Routes */}
          <Route element={<ProtectedRoute requiredRole="user" />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/sessions" element={<MyDevices />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/suspicious" element={<AdminSuspicious />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>

          {/* Redirect Root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;