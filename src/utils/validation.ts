import { z } from 'zod';

export const emailSchema = z.string().email('Некорректный email');

export const passwordSchema = z
  .string()
  .min(6, 'Пароль должен содержать минимум 6 символов');

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, 'Название задачи обязательно')
  .max(200, 'Название слишком длинное');

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerFormSchema = loginFormSchema.extend({
  name: z.string().trim().min(2, 'Имя слишком короткое'),
});

export const createTodoSchema = z.object({
  title: todoTitleSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type CreateTodoFormValues = z.infer<typeof createTodoSchema>;

export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown,
): { success: true; data: T } | { success: false; message: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const message = result.error.issues[0]?.message ?? 'Ошибка валидации';
  return { success: false, message };
}
