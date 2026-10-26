import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useTodoFilter } from 'src/composables/useTodoFilter';
import type { ITodoItem } from 'src/types';

const sample: ITodoItem[] = [
  {
    id: '1',
    title: 'Alpha task',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Beta done',
    completed: true,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('useTodoFilter', () => {
  it('filters active todos', () => {
    const todos = ref(sample);
    const { filter, filteredTodos } = useTodoFilter(todos);
    filter.value = 'active';
    expect(filteredTodos.value).toHaveLength(1);
    expect(filteredTodos.value[0]?.id).toBe('1');
  });

  it('filters completed todos', () => {
    const todos = ref(sample);
    const { filter, filteredTodos } = useTodoFilter(todos);
    filter.value = 'completed';
    expect(filteredTodos.value).toHaveLength(1);
    expect(filteredTodos.value[0]?.id).toBe('2');
  });

  it('filters by search query', () => {
    const todos = ref(sample);
    const { searchQuery, filteredTodos } = useTodoFilter(todos);
    searchQuery.value = 'beta';
    expect(filteredTodos.value).toHaveLength(1);
    expect(filteredTodos.value[0]?.id).toBe('2');
  });
});
