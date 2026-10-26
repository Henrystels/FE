import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from 'src/services/apiClient';
import { todoService } from 'src/services/todoService';

vi.mock('src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const todo = {
  id: 15,
  title: 'Купить хлеб',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('todoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists and normalizes todos', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [todo] });
    const list = await todoService.list(1);
    expect(list[0]?.id).toBe('15');
    expect(apiClient.get).toHaveBeenCalledWith('/todos', { params: { userId: 1 } });
  });

  it('creates, updates and deletes a todo', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: todo });
    const created = await todoService.create({ title: '  Купить хлеб  ' });
    expect(created.title).toBe('Купить хлеб');

    vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...todo, completed: true } });
    const updated = await todoService.update('15', { completed: true });
    expect(updated.completed).toBe(true);

    vi.mocked(apiClient.delete).mockResolvedValue({});
    await todoService.remove('15');
    expect(apiClient.delete).toHaveBeenCalledWith('/todos/15');
  });

  it('rejects an empty title before the request', async () => {
    await expect(todoService.create({ title: '   ' })).rejects.toThrow('Название задачи обязательно');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('rejects a malformed payload from the server', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ ...todo, title: ' ' }] });
    await expect(todoService.list()).rejects.toThrow('Название задачи обязательно');
  });
});
