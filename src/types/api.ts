import type { ITodoItem } from './todo';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
}

export interface UserProfile extends AuthUser {
  settings: UserSettings;
}

export type TodoDto = ITodoItem;

export interface TagDto {
  id: number;
  name: string;
  color: string;
}
