import { createContext } from 'react';
import type { AdminProfile } from '../types/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  admin: AdminProfile | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const NOT_ADMIN_MESSAGE = "You don't have administrator access.";
