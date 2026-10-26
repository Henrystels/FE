import { useAsync } from './useAsync';

export function useApi<T>() {
  return useAsync<T>();
}
