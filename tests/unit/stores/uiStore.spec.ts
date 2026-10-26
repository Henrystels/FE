import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { Dark, Notify } from 'quasar';
import { useUiStore } from 'src/stores/uiStore';

vi.mock('quasar', () => ({
  Dark: { set: vi.fn() },
  Notify: { create: vi.fn() },
}));

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('toggles theme, drawer and notifications', async () => {
    const ui = useUiStore();
    expect(Dark.set).toHaveBeenCalledWith(false);
    ui.toggleTheme();
    await nextTick();
    expect(ui.theme).toBe('dark');
    expect(Dark.set).toHaveBeenCalledWith(true);
    ui.setDrawer(false);
    expect(ui.drawerOpen).toBe(false);
    ui.notifyPositive('Сохранено');
    ui.notifyNegative('Ошибка');
    expect(Notify.create).toHaveBeenCalledTimes(2);
  });
});
