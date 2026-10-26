import { describe, expect, it } from 'vitest';
import { shouldShowError } from 'src/utils/formHelpers';

describe('formHelpers', () => {
  it('shows an error only after the field was touched', () => {
    expect(shouldShowError({ email: true }, 'email', 'Ошибка')).toBe(true);
    expect(shouldShowError({}, 'email', 'Ошибка')).toBe(false);
    expect(shouldShowError({ email: true }, 'email', undefined)).toBe(false);
  });
});
