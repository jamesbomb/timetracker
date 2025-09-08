import { createContext } from 'react';

interface BackendUser {
  id: number;
  email: string;
  full_name?: string;
  is_manager: boolean;
  is_superuser: boolean;
  unit_id?: number;
}

interface AuthContextType {
  currentUser: BackendUser | null;
  token: string | null;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signinWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export type { BackendUser, AuthContextType };
