import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isAxiosError } from 'axios';
import * as authService from '../services/authService';
import { tokenStore } from '../services/tokenStore';
import type { AdminProfile } from '../types/auth';
import {
  AuthContext,
  NOT_ADMIN_MESSAGE,
  type AuthStatus,
} from './auth-context';

// Prevent duplicate refresh-token rotation in React StrictMode.
let restorePromise: Promise<AdminProfile | null> | null = null;

async function restoreAdminSession(): Promise<AdminProfile | null> {
  const storedRefresh = tokenStore.getRefreshToken();

  if (!storedRefresh) {
    return null;
  }

  let rotatedRefreshToken: string | null = null;

  try {
    const tokens = await authService.refresh(storedRefresh);

    rotatedRefreshToken = tokens.refreshToken;

    // Save the rotated token immediately.
    tokenStore.setRefreshToken(tokens.refreshToken);

    const profile = await authService.getAdminProfile(tokens.accessToken);

    tokenStore.setAccessToken(tokens.accessToken);

    return profile;
  } catch (error) {
    // Revoke the rotated session if profile verification fails.
    if (rotatedRefreshToken) {
      await authService.logout(rotatedRefreshToken).catch(() => undefined);
    }

    tokenStore.clear();
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        if (!restorePromise) {
          restorePromise = restoreAdminSession().finally(() => {
            restorePromise = null;
          });
        }

        const profile = await restorePromise;

        if (cancelled) return;

        setAdmin(profile);
        setStatus(profile ? 'authenticated' : 'unauthenticated');
      } catch {
        if (cancelled) return;

        setAdmin(null);
        setStatus('unauthenticated');
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const session = await authService.login({
      identifier,
      password,
    });

    try {
      const profile = await authService.getAdminProfile(session.accessToken);

      tokenStore.setAccessToken(session.accessToken);
      tokenStore.setRefreshToken(session.refreshToken);

      setAdmin(profile);
      setStatus('authenticated');
    } catch (error) {
      await authService.logout(session.refreshToken).catch(() => undefined);

      tokenStore.clear();

      if (isAxiosError(error) && error.response?.status === 403) {
        throw new Error(NOT_ADMIN_MESSAGE, { cause: error });
      }

      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();

    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => undefined);
    }

    tokenStore.clear();
    setAdmin(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      admin,
      status,
      login,
      logout,
    }),
    [admin, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
