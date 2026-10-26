import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTodoStore } from 'src/stores/todoStore';
import { todoService } from 'src/services/todoService';
import type { ITodoItem } from 'src/types';

vi.mock('src/services/todoService', () => ({
  todoService: {
    list: vi.fn(async () => []),
    create: vi.fn(async (input: { title: string }) => ({
      id: '99',
      title: input.title,
      completed: false,
      createdAt: new Date().toISOString(),
    })),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const existing: ITodoItem = {
  id: '1',
  title: 'Existing',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('todoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('adds todo through action', async () => {
    const store = useTodoStore();
    const ok = await store.addTodo({ title: 'Test task' });
    expect(ok).toBe(true);
    expect(store.todos.some((t) => t.title === 'Test task')).toBe(true);
    expect(store.activeCount).toBe(1);
  });

  it('loads todos and stores a readable error', async () => {
    vi.mocked(todoService.list).mockResolvedValueOnce([existing]);
    const store = useTodoStore();
    await store.fetchTodos();
    expect(store.todos).toHaveLength(1);

    vi.mocked(todoService.list).mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 500, data: { message: 'Сбой сервера' } },
    });
    await store.fetchTodos();
    expect(store.error).toBe('Сбой сервера');
  });

  it('rolls back a failed toggle and ignores an unknown id', async () => {
    const store = useTodoStore();
    store.todos = [existing];
    await store.toggleTodo('missing');
    expect(todoService.update).not.toHaveBeenCalled();

    vi.mocked(todoService.update).mockResolvedValueOnce({ ...existing, completed: true });
    await store.toggleTodo('1');
    expect(store.todos[0]?.completed).toBe(true);

    vi.mocked(todoService.update).mockRejectedValueOnce(new Error('offline'));
    await store.toggleTodo('1');
    expect(store.todos[0]?.completed).toBe(true);
  });

  it('rolls back a failed delete and filters the list', async () => {
    const store = useTodoStore();
    store.todos = [existing, { ...existing, id: '2', title: 'Done', completed: true }];
    vi.mocked(todoService.remove).mockResolvedValueOnce(undefined);
    await store.deleteTodo('2');
    expect(store.todos).toHaveLength(1);

    vi.mocked(todoService.remove).mockRejectedValueOnce(new Error('offline'));
    await store.deleteTodo('1');
    expect(store.todos.some((todo) => todo.id === '1')).toBe(true);

    store.setFilter('completed');
    store.setSearchQuery('done');
    expect(store.filter).toBe('completed');
    expect(store.searchQuery).toBe('done');
  });

  it('reports a failed create', async () => {
    vi.mocked(todoService.create).mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 422, data: { message: 'Название задачи обязательно' } },
    });
    const store = useTodoStore();
    expect(await store.addTodo({ title: '' })).toBe(false);
    expect(store.error).toBe('Название задачи обязательно');
  });
});
