export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export type ProviderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  providerProfile: {
    status: ProviderStatus;
    isAvailable: boolean;
  } | null;
}
