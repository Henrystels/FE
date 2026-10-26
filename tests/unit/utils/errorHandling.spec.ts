import { describe, expect, it, vi } from 'vitest';
import {
  AppError,
  classifyAxiosError,
  logError,
  userFacingMessage,
} from 'src/utils/errorHandling';

describe('errorHandling', () => {
  it('returns an existing AppError unchanged', () => {
    const error = new AppError('Своя ошибка', 'business', 409);
    expect(classifyAxiosError(error)).toBe(error);
  });

  it('classifies network, auth, validation and business errors', () => {
    const network = classifyAxiosError({ isAxiosError: true, message: 'Network Error' });
    expect(network.kind).toBe('network');

    const auth = classifyAxiosError({
      isAxiosError: true,
      message: 'Request failed with status code 401',
      response: { status: 401, data: { message: 'Неверный email или пароль' } },
    });
    expect(auth.kind).toBe('auth');
    expect(userFacingMessage(auth)).toBe('Неверный email или пароль');

    const genericAuth = classifyAxiosError({
      isAxiosError: true,
      message: 'Request failed with status code 401',
      response: { status: 401, data: {} },
    });
    expect(userFacingMessage(genericAuth)).toBe('Войдите в аккаунт, чтобы продолжить.');

    const validation = classifyAxiosError({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 422, data: { message: 'Email уже используется', details: { email: ['занят'] } } },
    });
    expect(validation.kind).toBe('validation');
    expect(validation.details?.email).toEqual(['занят']);

    const business = classifyAxiosError({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 500, data: { message: 'Сбой сервера' } },
    });
    expect(userFacingMessage(business)).toBe('Сбой сервера');
  });

  it('classifies generic errors and unknown values', () => {
    expect(classifyAxiosError(new Error('boom')).kind).toBe('unknown');
    expect(classifyAxiosError('x').message).toBe('Неизвестная ошибка');
    expect(userFacingMessage(new AppError('x', 'network'))).toContain('подключение');
    expect(userFacingMessage(new AppError('x', 'unknown'))).toContain('Попробуйте позже');
  });

  it('logs only while developing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logError(new Error('hidden'), 'test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
