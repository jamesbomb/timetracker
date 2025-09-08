import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: ReactElement;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser, token } = useAuth();

  if (token && !currentUser) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;