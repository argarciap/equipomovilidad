/**
 * AuthProvider component that wraps the app and provides authentication state.
 * Receives an AuthService implementation as a prop (dependency inversion).
 *
 * Requisitos: 2.1, 2.3, 2.4, 2.5, 2.6, 7.3
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthService, User } from '../types';
import { AuthContext, type AuthContextType } from './AuthContext';
import { getAvailableUsers } from './MockAuthService';

interface AuthProviderProps {
  authService: AuthService;
  children: React.ReactNode;
}

export function AuthProvider({ authService, children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const restored = await authService.getCurrentUser();
        if (!cancelled) {
          setUser(restored);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authService]);

  const login = useCallback(
    async (userId: string): Promise<void> => {
      const loggedIn = await authService.login(userId);
      setUser(loggedIn);
    },
    [authService],
  );

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  }, [authService]);

  const availableUsers = useMemo(() => getAvailableUsers(), []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      availableUsers,
    }),
    [user, isLoading, login, logout, availableUsers],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
