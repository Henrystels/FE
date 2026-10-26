import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { useLocalStorage } from 'src/composables/useLocalStorage';

describe('useLocalStorage', () => {
  it('reads stored json and writes changes', async () => {
    localStorage.setItem('prefs', JSON.stringify({ theme: 'dark' }));
    const data = useLocalStorage('prefs', { theme: 'light' });
    expect(data.value.theme).toBe('dark');
    data.value = { theme: 'light' };
    await nextTick();
    expect(localStorage.getItem('prefs')).toContain('light');
  });

  it('falls back when stored json is invalid', () => {
    localStorage.setItem('broken', '{');
    const data = useLocalStorage('broken', 4);
    expect(data.value).toBe(4);
  });
});
