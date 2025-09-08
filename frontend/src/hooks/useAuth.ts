import { AuthContext } from '../contexts/AuthContextType';
import { useContext } from 'react';

export const useAuth = () => useContext(AuthContext);
