import { api } from './api';
import type {
  AdminProfile,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '../types/auth';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function getAdminProfile(
  accessToken: string,
): Promise<AdminProfile> {
  const { data } = await api.get<AdminProfile>('/admin/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
