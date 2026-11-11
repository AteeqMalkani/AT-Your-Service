export interface AuthUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  providerProfile?: unknown | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
}