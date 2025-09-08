import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ManagerRouteProps {
  children: ReactElement;
}

function ManagerRoute({ children }: ManagerRouteProps) {
  const { currentUser, token } = useAuth();
  
  // se sta ancora caricando, mostra loading
  if (token && !currentUser) {
    return <div>Loading...</div>;
  }
  
  // se non è loggato o non è manager, redirect al dashboard
  if (!token || !currentUser || !currentUser.is_manager) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default ManagerRoute;
