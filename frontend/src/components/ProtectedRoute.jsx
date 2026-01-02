import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const ProtectedRoute = ({ requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If admin tries to access user page or vice versa, redirect to their dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
};

export default ProtectedRoute;