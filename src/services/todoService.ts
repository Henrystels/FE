import type { CreateTodoInput, ITodoItem, UpdateTodoInput } from 'src/types';
import { createTodoSchema } from 'src/utils/validation';
import { AppError } from 'src/utils/errorHandling';
import { apiClient } from './apiClient';

function parseTodo(raw: ITodoItem): ITodoItem {
  const parsed = createTodoSchema.safeParse({ title: raw.title });
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Некорректная задача', 'validation');
  }
  return {
    ...raw,
    id: String(raw.id),
    title: parsed.data.title,
  };
}

export const todoService = {
  async list(userId?: number): Promise<ITodoItem[]> {
    const params = userId ? { userId } : undefined;
    const { data } = await apiClient.get<ITodoItem[]>('/todos', { params });
    return data.map(parseTodo);
  },

  async create(input: CreateTodoInput): Promise<ITodoItem> {
    const parsed = createTodoSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Ошибка валидации', 'validation');
    }
    const { data } = await apiClient.post<ITodoItem>('/todos', {
      ...parsed.data,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    return parseTodo(data);
  },

  async update(id: string, input: UpdateTodoInput): Promise<ITodoItem> {
    const { data } = await apiClient.patch<ITodoItem>(`/todos/${id}`, input);
    return parseTodo(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/todos/${id}`);
  },
};
