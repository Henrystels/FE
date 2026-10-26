import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from 'src/services/authService';
import { apiClient, clearTokens, setTokens } from 'src/services/apiClient';

vi.mock('src/services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

const session = {
  user: { id: 1, email: 'demo@todo.app', name: 'Demo' },
  tokens: { accessToken: 'a', refreshToken: 'r' },
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores tokens after login and register', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: session });
    await expect(authService.login({ email: 'demo@todo.app', password: 'password' })).resolves.toEqual(session);
    await expect(
      authService.register({ email: 'new@todo.app', password: 'password', name: 'New' }),
    ).resolves.toEqual(session);
    expect(setTokens).toHaveBeenCalledWith('a', 'r');
  });

  it('loads the profile and checks email availability', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { ...session.user, settings: { theme: 'light', emailNotifications: true } },
    });
    const profile = await authService.fetchProfile();
    expect(profile.email).toBe('demo@todo.app');

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { available: false } });
    await expect(authService.isEmailAvailable('demo@todo.app')).resolves.toBe(false);
  });

  it('clears tokens on logout', () => {
    authService.logout();
    expect(clearTokens).toHaveBeenCalled();
  });
});
