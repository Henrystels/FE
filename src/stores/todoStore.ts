import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { CreateTodoInput, ITodoItem, TodoFilter } from 'src/types';
import { todoService } from 'src/services/todoService';
import { useLocalStorage } from 'src/composables/useLocalStorage';
import { useTodoFilter } from 'src/composables/useTodoFilter';
import { useApi } from 'src/composables/useApi';
import { useUserStore } from './userStore';

export const useTodoStore = defineStore('todo', () => {
  const todos = useLocalStorage<ITodoItem[]>('todo_items', []);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { filter, searchQuery, filteredTodos } = useTodoFilter(todos);
  const requests = useApi<unknown>();
  const activeCount = computed(() => todos.value.filter((t) => !t.completed).length);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    const result = (await requests.execute(fn, 1)) as T | null;
    loading.value = false;
    if (requests.errorMessage.value) {
      error.value = requests.errorMessage.value;
      return null;
    }
    return result;
  }

  async function fetchTodos(): Promise<void> {
    const userStore = useUserStore();
    const list = await run(() => todoService.list(userStore.user?.id));
    if (list) {
      todos.value = list;
    }
  }

  async function addTodo(input: CreateTodoInput): Promise<boolean> {
    const userStore = useUserStore();
    const payload = userStore.user?.id ? { ...input, userId: userStore.user.id } : input;
    const created = await run(() => todoService.create(payload));
    if (!created) {
      return false;
    }
    todos.value = [created, ...todos.value];
    return true;
  }

  async function toggleTodo(id: string): Promise<void> {
    const item = todos.value.find((t) => t.id === id);
    if (!item) {
      return;
    }
    const completed = !item.completed;
    todos.value = todos.value.map((t) => (t.id === id ? { ...t, completed } : t));
    const updated = await run(() => todoService.update(id, { completed }));
    if (!updated) {
      todos.value = todos.value.map((t) => (t.id === id ? { ...t, completed: !completed } : t));
    }
  }

  async function deleteTodo(id: string): Promise<void> {
    const backup = [...todos.value];
    todos.value = todos.value.filter((t) => t.id !== id);
    const removed = await run(async () => {
      await todoService.remove(id);
      return true;
    });
    if (!removed) {
      todos.value = backup;
    }
  }

  function setFilter(value: TodoFilter): void {
    filter.value = value;
  }

  function setSearchQuery(value: string): void {
    searchQuery.value = value;
  }

  return {
    todos,
    loading,
    error,
    filter,
    searchQuery,
    activeCount,
    filteredTodos,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    setSearchQuery,
  };
});
