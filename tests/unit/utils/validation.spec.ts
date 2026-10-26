import { describe, expect, it } from 'vitest';
import { createTodoSchema, emailSchema, validateField } from 'src/utils/validation';

describe('validation utils', () => {
  it('rejects empty todo title', () => {
    const result = createTodoSchema.safeParse({ title: '   ' });
    expect(result.success).toBe(false);
  });

  it('validates email', () => {
    const ok = validateField(emailSchema, 'user@example.com');
    expect(ok.success).toBe(true);
    const bad = validateField(emailSchema, 'invalid');
    expect(bad.success).toBe(false);
  });
});
