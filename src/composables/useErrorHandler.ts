import { useUiStore } from 'src/stores/uiStore';
import { classifyAxiosError, logError, userFacingMessage } from 'src/utils/errorHandling';

export function useErrorHandler() {
  const ui = useUiStore();

  function handleError(error: unknown, context?: string): void {
    const appError = classifyAxiosError(error);
    logError(appError, context);
    ui.notifyNegative(userFacingMessage(appError));
  }

  return { handleError };
}
