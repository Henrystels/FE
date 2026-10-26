import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { Notify } from 'quasar';
import { useErrorHandler } from 'src/composables/useErrorHandler';

vi.mock('quasar', () => ({
  Dark: { set: vi.fn() },
  Notify: { create: vi.fn() },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('shows a user-facing notification', () => {
    const { handleError } = useErrorHandler();
    handleError({ isAxiosError: true, message: 'Network Error' }, 'save');
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'negative' }),
    );
  });
});