import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: ReactElement;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, token } = useAuth();
  
  // se c'è un token ma currentUser non è ancora caricato, mostra un loading
  if (token && !currentUser) {
    return <div>Loading...</div>;
  }
  
  // se non c'è né token né currentUser, reindirizza al login
  if (!token && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default PrivateRoute;
