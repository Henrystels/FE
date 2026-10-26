import type { LoginRequest, LoginResponse, RegisterRequest, UserProfile } from 'src/types';
import { apiClient, clearTokens, setTokens } from './apiClient';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data;
  },

  async register(payload: RegisterRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/register', payload);
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data;
  },

  async fetchProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/users/me');
    return data;
  },

  async isEmailAvailable(email: string): Promise<boolean> {
    const { data } = await apiClient.get<{ available: boolean }>('/auth/email-available', {
      params: { email },
      headers: { 'x-skip-cache': '1' },
    });
    return data.available;
  },

  logout(): void {
    clearTokens();
  },
};
