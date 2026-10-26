import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AuthUser, LoginRequest, RegisterRequest, UserSettings } from 'src/types';
import { authService } from 'src/services/authService';
import { getAccessToken } from 'src/services/apiClient';
import { useLocalStorage } from 'src/composables/useLocalStorage';
import { useApi } from 'src/composables/useApi';

export const useUserStore = defineStore('user', () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const settings = useLocalStorage<UserSettings>('user_settings', {
    theme: 'light',
    emailNotifications: true,
  });
  const requests = useApi<unknown>();

  const isAuthenticated = computed(() => Boolean(user.value && getAccessToken()));

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    const result = (await requests.execute(fn, 1)) as T | null;
    loading.value = false;
    if (requests.errorMessage.value) {
      error.value = requests.errorMessage.value;
      return null;
    }
    return result;
  }

  async function login(payload: LoginRequest): Promise<boolean> {
    const response = await run(() => authService.login(payload));
    if (!response) {
      return false;
    }
    user.value = response.user;
    return true;
  }

  async function register(payload: RegisterRequest): Promise<boolean> {
    const response = await run(() => authService.register(payload));
    if (!response) {
      return false;
    }
    user.value = response.user;
    return true;
  }

  async function restoreSession(): Promise<void> {
    if (!getAccessToken()) {
      user.value = null;
      return;
    }
    const profile = await run(() => authService.fetchProfile());
    if (!profile) {
      user.value = null;
      authService.logout();
      return;
    }
    user.value = profile;
    settings.value = profile.settings;
  }

  function logout(): void {
    authService.logout();
    user.value = null;
  }

  function clearError(): void {
    error.value = null;
  }

  function updateSettings(partial: Partial<UserSettings>): void {
    settings.value = { ...settings.value, ...partial };
  }

  return {
    user,
    settings,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    restoreSession,
    logout,
    clearError,
    updateSettings,
  };
});
