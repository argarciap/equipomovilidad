import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthService, User } from '@/types';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';

interface AuthProviderProps {
  authService: AuthService;
  availableUsers: User[];
  children: React.ReactNode;
}

export function AuthProvider({
  authService,
  availableUsers,
  children,
}: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const restored = await authService.getCurrentUser();
        if (!cancelled) {
          setUser(restored);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
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
      const loggedInUser = await authService.login(userId);
      setUser(loggedInUser);
    },
    [authService],
  );

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  }, [authService]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      availableUsers,
      login,
      logout,
    }),
    [user, isLoading, availableUsers, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
