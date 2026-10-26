import { describe, expect, it, vi } from 'vitest';
import { loginFormSchema } from 'src/utils/validation';
import { useValidation } from 'src/composables/useValidation';
import { authService } from 'src/services/authService';

vi.mock('src/services/authService', () => ({
  authService: {
    isEmailAvailable: vi.fn(),
  },
}));

describe('useValidation', () => {
  it('marks invalid login fields', () => {
    const { values, validateAll, validateField, errors, isValid } = useValidation(loginFormSchema);
    values.email = 'bad';
    values.password = '123';
    expect(validateField('email')).toBe(false);
    expect(validateAll()).toBe(false);
    expect(errors.email).toBeDefined();
    expect(isValid.value).toBe(false);
  });

  it('accepts a valid field even when another field is still invalid', () => {
    const { values, validateField, errors } = useValidation(loginFormSchema);
    values.email = 'user@example.com';
    values.password = '123';
    expect(validateField('email')).toBe(true);
    expect(errors.email).toBeUndefined();
  });

  it('clears errors when the whole form is valid', () => {
    const { values, validateAll, errors } = useValidation(loginFormSchema);
    values.email = 'bad';
    validateAll();
    values.email = 'user@example.com';
    values.password = 'secret1';
    expect(validateAll()).toBe(true);
    expect(errors.email).toBeUndefined();
  });

  it('checks email uniqueness', async () => {
    vi.mocked(authService.isEmailAvailable).mockResolvedValueOnce(false);
    const { values, ensureEmailAvailable, errors } = useValidation(loginFormSchema);
    values.email = 'used@todo.app';
    values.password = 'secret1';
    expect(await ensureEmailAvailable('email')).toBe(false);
    expect(errors.email).toBe('Email уже используется');

    vi.mocked(authService.isEmailAvailable).mockResolvedValueOnce(true);
    expect(await ensureEmailAvailable('email')).toBe(true);
    expect(errors.email).toBeUndefined();
  });

  it('skips the request when the email is invalid and reports a failed check', async () => {
    vi.mocked(authService.isEmailAvailable).mockClear();
    const { values, ensureEmailAvailable, errors } = useValidation(loginFormSchema);
    values.email = 'bad';
    expect(await ensureEmailAvailable('email')).toBe(false);
    expect(authService.isEmailAvailable).not.toHaveBeenCalled();

    values.email = 'user@example.com';
    vi.mocked(authService.isEmailAvailable).mockRejectedValueOnce(new Error('offline'));
    expect(await ensureEmailAvailable('email')).toBe(false);
    expect(errors.email).toContain('Не удалось проверить email');
  });
});
