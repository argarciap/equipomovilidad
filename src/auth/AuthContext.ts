/**
 * React Context and hook for authentication state.
 *
 * Requisitos: 2.1, 2.3, 2.4, 2.5, 2.6, 7.3
 */

import { createContext, useContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  availableUsers: User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to consume the auth context.
 * Throws if used outside an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
