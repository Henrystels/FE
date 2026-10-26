import { computed, ref, type Ref } from 'vue';
import type { ITodoItem, TodoFilter } from 'src/types';

export function useTodoFilter(todos: Ref<ITodoItem[]>) {
  const filter = ref<TodoFilter>('all');
  const searchQuery = ref('');

  const filteredTodos = computed(() => {
    let list = todos.value;

    switch (filter.value) {
      case 'active':
        list = list.filter((t) => !t.completed);
        break;
      case 'completed':
        list = list.filter((t) => t.completed);
        break;
      default:
        break;
    }

    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }

    return list;
  });

  return {
    filter,
    searchQuery,
    filteredTodos,
  };
}
