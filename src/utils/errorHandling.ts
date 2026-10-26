import type { AxiosError } from 'axios';
import type { ApiErrorBody } from 'src/types';

export type AppErrorKind = 'network' | 'validation' | 'business' | 'auth' | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    kind: AppErrorKind = 'unknown',
    status?: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    if (status !== undefined) {
      this.status = status;
    }
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function classifyAxiosError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  if (axiosError.isAxiosError) {
    if (!axiosError.response) {
      return new AppError('Нет соединения с сервером', 'network');
    }
    const status = axiosError.response.status;
    const body = axiosError.response.data;
    const message = body?.message ?? axiosError.message;

    if (status === 401) {
      const serverMessage = body?.message?.trim();
      const message =
        serverMessage && !/^request failed/i.test(serverMessage)
          ? serverMessage
          : 'Войдите в аккаунт, чтобы продолжить.';
      return new AppError(message, 'auth', status);
    }
    if (status === 400 || status === 422) {
      return new AppError(message, 'validation', status, body?.details);
    }
    return new AppError(message, 'business', status);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'unknown');
  }

  return new AppError('Неизвестная ошибка', 'unknown');
}

export function userFacingMessage(error: AppError): string {
  switch (error.kind) {
    case 'network':
      return 'Проверьте подключение к интернету и повторите попытку.';
    case 'auth':
      return error.message;
    case 'validation':
    case 'business':
      return error.message;
    default:
      return 'Что-то пошло не так. Попробуйте позже.';
  }
}

export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(context ?? 'App error', error);
  }
}
