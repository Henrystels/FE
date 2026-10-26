import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Dark, Notify } from 'quasar';
import { useLocalStorage } from 'src/composables/useLocalStorage';

export const useUiStore = defineStore('ui', () => {
  const drawerOpen = ref(true);
  const theme = useLocalStorage<'light' | 'dark'>('ui_theme', 'light');

  function applyTheme(value: 'light' | 'dark'): void {
    Dark.set(value === 'dark');
  }

  watch(
    theme,
    (value) => {
      applyTheme(value);
    },
    { immediate: true },
  );

  function toggleTheme(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  function setDrawer(open: boolean): void {
    drawerOpen.value = open;
  }

  function notifyPositive(message: string): void {
    Notify.create({ type: 'positive', message, position: 'top' });
  }

  function notifyNegative(message: string): void {
    Notify.create({ type: 'negative', message, position: 'top' });
  }

  return {
    drawerOpen,
    theme,
    toggleTheme,
    setDrawer,
    notifyPositive,
    notifyNegative,
  };
});
