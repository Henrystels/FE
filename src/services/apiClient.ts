import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { AppError } from 'src/utils/errorHandling';

const TOKEN_KEY = 'todo_access_token';
const REFRESH_KEY = 'todo_refresh_token';

const responseCache = new Map<string, { expires: number; data: unknown }>();
const CACHE_TTL_MS = 30_000;

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function cacheKey(config: InternalAxiosRequestConfig): string {
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${config.method ?? 'get'}:${config.url ?? ''}:${params}`;
}

export function createApiClient(existing?: AxiosInstance): AxiosInstance {
  const client =
    existing ??
    axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === 'get' && !config.headers['x-skip-cache']) {
      const key = cacheKey(config);
      const cached = responseCache.get(key);
      if (cached && cached.expires > Date.now()) {
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          });
      }
    }

    return config;
  });

  let refreshPromise: Promise<string> | null = null;

  client.interceptors.response.use(
    (response) => {
      const config = response.config;
      if (config.method?.toLowerCase() === 'get' && !config.headers['x-skip-cache']) {
        responseCache.set(cacheKey(config), {
          data: response.data,
          expires: Date.now() + CACHE_TTL_MS,
        });
      }
      return response;
    },
    async (error) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && original && !original._retry) {
        original._retry = true;
        const refresh = getRefreshToken();
        if (!refresh) {
          throw error;
        }

        if (!refreshPromise) {
          refreshPromise = client
            .post<{ accessToken: string }>('/auth/refresh', { refreshToken: refresh })
            .then((res) => {
              const accessToken = res.data.accessToken;
              setTokens(accessToken, refresh);
              return accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          const newToken = await refreshPromise;
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch {
          clearTokens();
          throw new AppError('Сессия истекла', 'auth', 401);
        }
      }

      throw error;
    },
  );

  return client;
}

export const apiClient = createApiClient();
