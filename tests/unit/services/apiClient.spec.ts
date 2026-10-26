import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { AppError } from 'src/utils/errorHandling';
import { clearTokens, createApiClient, getAccessToken, getRefreshToken, setTokens } from 'src/services/apiClient';

function createMockClient() {
  const requestUse = vi.fn();
  const responseUse = vi.fn();
  const client = Object.assign(vi.fn(), {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
    post: vi.fn(),
  }) as unknown as AxiosInstance & {
    post: ReturnType<typeof vi.fn>;
  };
  createApiClient(client);
  return { client, requestUse, responseUse };
}

interface LooseConfig {
  method?: string;
  url?: string;
  headers: Record<string, string>;
  params?: unknown;
  adapter?: (config: LooseConfig) => Promise<{ data: unknown }>;
}

type RequestHook = (config: LooseConfig) => LooseConfig;
type ResponseHook = (response: {
  data: unknown;
  config: LooseConfig;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}) => Promise<unknown> | unknown;
type ErrorHook = (error: {
  response?: { status: number };
  config?: LooseConfig & { _retry?: boolean };
}) => Promise<unknown>;

function hooks(requestUse: ReturnType<typeof vi.fn>, responseUse: ReturnType<typeof vi.fn>): {
  request: RequestHook;
  response: ResponseHook;
  error: ErrorHook;
} {
  const request = requestUse.mock.calls.at(-1)?.[0] as RequestHook;
  const response = responseUse.mock.calls.at(-1)?.[0] as ResponseHook;
  const error = responseUse.mock.calls.at(-1)?.[1] as ErrorHook;
  return { request, response, error };
}

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and clears tokens', () => {
    setTokens('access', 'refresh');
    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('adds the bearer token and serves a cached GET', async () => {
    const { requestUse, responseUse } = createMockClient();
    const { request, response } = hooks(requestUse, responseUse);
    setTokens('access', 'refresh');
    const config: LooseConfig = { method: 'get', url: '/todos', headers: {} };
    const withToken = request(config);
    expect(withToken.headers.Authorization).toBe('Bearer access');

    await response({
      data: [{ id: '1' }],
      config: withToken,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const cached = request({ method: 'get', url: '/todos', headers: {} });
    expect(typeof cached.adapter).toBe('function');
    const resolved = await cached.adapter?.(cached);
    expect(resolved?.data).toEqual([{ id: '1' }]);

    const skipped = request({
      method: 'get',
      url: '/todos',
      headers: { 'x-skip-cache': '1' },
    });
    expect(skipped.adapter).toBeUndefined();

    const post = request({ method: 'post', url: '/todos', headers: {} });
    expect(post.adapter).toBeUndefined();
  });

  it('refreshes the access token after 401 and retries the request', async () => {
    const { client, requestUse, responseUse } = createMockClient();
    const { error } = hooks(requestUse, responseUse);
    setTokens('old', 'refresh');
    client.post.mockResolvedValue({ data: { accessToken: 'new' } });
    vi.mocked(client).mockResolvedValue({ data: 'ok' });

    const result = await error({
      response: { status: 401 },
      config: { method: 'get', url: '/todos', headers: {} },
    });

    expect(client.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh' });
    expect(getAccessToken()).toBe('new');
    expect(result).toEqual({ data: 'ok' });
  });

  it('rethrows 401 when there is no refresh token', async () => {
    const { requestUse, responseUse } = createMockClient();
    const { error } = hooks(requestUse, responseUse);
    const failure = { response: { status: 401 }, config: { headers: {}, url: '/todos', method: 'get' } };
    await expect(error(failure)).rejects.toBe(failure);
  });

  it('clears tokens when refresh fails', async () => {
    const { client, requestUse, responseUse } = createMockClient();
    const { error } = hooks(requestUse, responseUse);
    setTokens('old', 'refresh');
    client.post.mockRejectedValue(new Error('nope'));
    await expect(
      error({
        response: { status: 401 },
        config: { method: 'get', url: '/secret', headers: {} },
      }),
    ).rejects.toBeInstanceOf(AppError);
    expect(getAccessToken()).toBeNull();
  });

  it('rethrows other status codes', async () => {
    const { requestUse, responseUse } = createMockClient();
    const { error } = hooks(requestUse, responseUse);
    const failure = { response: { status: 500 }, config: { headers: {}, method: 'get', url: '/todos' } };
    await expect(error(failure)).rejects.toBe(failure);
  });
});
