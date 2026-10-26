import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { authService } from 'src/services/authService';
import { useUserStore } from 'src/stores/userStore';

const authState = vi.hoisted(() => ({ token: 'token' as string | null }));

vi.mock('src/services/apiClient', () => ({
  getAccessToken: () => authState.token,
}));

vi.mock('src/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    fetchProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

const user = { id: 1, email: 'demo@todo.app', name: 'Demo' };

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    authState.token = 'token';
    vi.clearAllMocks();
  });

  it('logs in and registers', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user,
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    const store = useUserStore();
    expect(await store.login({ email: user.email, password: 'password' })).toBe(true);
    expect(store.isAuthenticated).toBe(true);

    vi.mocked(authService.register).mockResolvedValue({
      user: { ...user, email: 'new@todo.app' },
      tokens: { accessToken: 'a', refreshToken: 'r' },
    });
    expect(await store.register({ email: 'new@todo.app', password: 'password', name: 'New' })).toBe(true);
    expect(store.user?.email).toBe('new@todo.app');
  });

  it('keeps a readable auth error', async () => {
    vi.mocked(authService.login).mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 401, data: { message: 'Неверный email или пароль' } },
    });
    const store = useUserStore();
    expect(await store.login({ email: user.email, password: 'nope' })).toBe(false);
    expect(store.error).toBe('Неверный email или пароль');
  });

  it('restores a session and logs out when the profile request fails', async () => {
    vi.mocked(authService.fetchProfile).mockResolvedValue({
      ...user,
      settings: { theme: 'dark', emailNotifications: false },
    });
    const store = useUserStore();
    await store.restoreSession();
    expect(store.user?.name).toBe('Demo');
    expect(store.settings.theme).toBe('dark');

    authState.token = null;
    await store.restoreSession();
    expect(store.user).toBeNull();

    authState.token = 'token';
    vi.mocked(authService.fetchProfile).mockRejectedValue(new Error('expired'));
    await store.restoreSession();
    expect(authService.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
  });

  it('updates settings and clears the user on logout', () => {
    const store = useUserStore();
    store.updateSettings({ emailNotifications: false });
    expect(store.settings.emailNotifications).toBe(false);
    store.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
    store.clearError();
    expect(store.error).toBeNull();
  });
});
