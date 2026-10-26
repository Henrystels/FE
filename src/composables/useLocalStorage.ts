import { ref, watch, type Ref } from 'vue';

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return defaultValue;
      }
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  };

  const data = ref<T>(read()) as Ref<T>;

  watch(
    data,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { deep: true },
  );

  return data;
}
