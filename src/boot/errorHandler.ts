import { defineBoot } from '#q-app';
import { classifyAxiosError, logError } from 'src/utils/errorHandling';

export default defineBoot(() => {
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'unhandledrejection');
    const appError = classifyAxiosError(event.reason);
    event.preventDefault();
    if (import.meta.env.DEV) {
      console.warn(appError.message);
    }
  });

  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message, 'window.error');
  });
});
