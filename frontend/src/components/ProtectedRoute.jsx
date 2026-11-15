import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loading } from './ui.jsx';

// <ProtectedRoute role="admin" /> renders child routes only for that role.
// Omit `role` to allow any signed-in user (profile, settings).
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <Outlet />;
}
