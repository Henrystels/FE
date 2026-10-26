import { computed, reactive, toValue, type MaybeRefOrGetter } from 'vue';
import type { ZodType } from 'zod';
import { authService } from 'src/services/authService';

export function useValidation<T extends Record<string, unknown>>(
  schemaSource: MaybeRefOrGetter<ZodType<T>>,
  initial?: Partial<T>,
) {
  const values = reactive({ ...(initial ?? {}) }) as T;
  const errors = reactive<Record<string, string>>({});
  const touched = reactive<Record<string, boolean>>({});

  function schema(): ZodType<T> {
    return toValue(schemaSource);
  }

  function validateField(field: keyof T & string): boolean {
    const result = schema().safeParse({ ...values });
    if (result.success) {
      delete errors[field];
      return true;
    }
    const issue = result.error.issues.find((item) => item.path[0] === field);
    if (issue) {
      errors[field] = issue.message;
      return false;
    }
    delete errors[field];
    return true;
  }

  function validateAll(): boolean {
    const result = schema().safeParse(values);
    if (result.success) {
      Object.keys(errors).forEach((key) => delete errors[key]);
      return true;
    }
    result.error.issues.forEach((issue) => {
      const key = String(issue.path[0] ?? '');
      if (key) {
        errors[key] = issue.message;
      }
    });
    return false;
  }

  async function ensureEmailAvailable(field: keyof T & string): Promise<boolean> {
    if (!validateField(field)) {
      return false;
    }
    try {
      const available = await authService.isEmailAvailable(String(values[field] ?? ''));
      if (!available) {
        errors[field] = 'Email уже используется';
        return false;
      }
      delete errors[field];
      return true;
    } catch {
      errors[field] = 'Не удалось проверить email. Попробуйте ещё раз.';
      return false;
    }
  }

  const isValid = computed(() => Object.keys(errors).length === 0);

  return {
    values,
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    ensureEmailAvailable,
  };
}
