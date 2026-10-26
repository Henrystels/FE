import { ref } from 'vue';
import { classifyAxiosError, logError, userFacingMessage } from 'src/utils/errorHandling';

export function useAsync<T>() {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);

  async function execute(fn: () => Promise<T>, retries = 1): Promise<T | null> {
    loading.value = true;
    errorMessage.value = null;

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await fn();
        data.value = result;
        loading.value = false;
        return result;
      } catch (error) {
        const appError = classifyAxiosError(error);
        logError(appError, 'useAsync');
        if (appError.kind === 'network' && attempt < retries) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        errorMessage.value = userFacingMessage(appError);
        loading.value = false;
        return null;
      }
    }

    loading.value = false;
    return null;
  }

  function reset(): void {
    data.value = null;
    errorMessage.value = null;
    loading.value = false;
  }

  return { data, loading, errorMessage, execute, reset };
}
