import { defineBoot } from '#q-app';
import { logError } from 'src/utils/errorHandling';

/** Mock Sentry integration for production monitoring demos. */
export default defineBoot(() => {
  if (String(import.meta.env.VITE_SENTRY_ENABLED) !== 'true') {
    return;
  }

  const mockSentry: SentryMock = {
    captureException(error: unknown): void {
      logError(error, 'sentry-mock');
    },
  };

  window.__SENTRY_MOCK__ = mockSentry;
});

interface SentryMock {
  captureException(error: unknown): void;
}

declare global {
  interface Window {
    __SENTRY_MOCK__?: SentryMock;
  }
}
