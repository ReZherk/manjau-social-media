import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { getLandingPath } from '@/app/config/menu';

export function GuestRoute() {
  const { isAuthenticated, user, hasPermission } = useAuth();
  if (isAuthenticated) {
    if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
    return <Navigate to={getLandingPath(hasPermission)} replace />;
  }
  return <Outlet />;
}
