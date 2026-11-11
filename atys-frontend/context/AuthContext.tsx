import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../constants/auth";
import { authService } from "../services/auth";
import { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthUser>;

  return (
    typeof candidate.id === "string" && typeof candidate.fullName === "string"
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback(
    async (token: string, currentUser: AuthUser) => {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

      try {
        await SecureStore.setItemAsync(
          AUTH_USER_KEY,
          JSON.stringify(currentUser),
        );
      } catch (error) {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        throw error;
      }

      setUser(currentUser);
    },
    [],
  );

  const clearSession = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_USER_KEY),
    ]);

    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const [token, cachedUserValue] = await Promise.all([
          SecureStore.getItemAsync(AUTH_TOKEN_KEY),
          SecureStore.getItemAsync(AUTH_USER_KEY),
        ]);

        if (!token) {
          if (cachedUserValue) {
            await SecureStore.deleteItemAsync(AUTH_USER_KEY);
          }

          return;
        }

        let cachedUser: AuthUser | null = null;

        if (cachedUserValue) {
          try {
            const parsedUser: unknown = JSON.parse(cachedUserValue);

            if (isAuthUser(parsedUser)) {
              cachedUser = parsedUser;
            } else {
              await SecureStore.deleteItemAsync(AUTH_USER_KEY);
            }
          } catch {
            await SecureStore.deleteItemAsync(AUTH_USER_KEY);
          }
        }

        // Restore the saved profile immediately while the token
        // is being checked with the backend.
        if (mounted && cachedUser) {
          setUser(cachedUser);
        }

        try {
          const currentUser = await authService.getCurrentUser();

          await SecureStore.setItemAsync(
            AUTH_USER_KEY,
            JSON.stringify(currentUser),
          );

          if (mounted) {
            setUser(currentUser);
          }
        } catch (error) {
          const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;

          if (status === 401 || status === 403) {
            await clearSession();
          } else if (mounted && !cachedUser) {
            // No cached profile is available, so the app cannot
            // restore a usable user session while offline.
            setUser(null);
          }

          // Network errors and server errors do not automatically
          // destroy a previously saved session.
        }
      } catch (error) {
        console.error("Failed to restore authentication session:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      await persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authService.register(payload);
      await persistSession(result.accessToken, result.user);
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
