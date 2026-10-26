<script setup lang="ts">
import { onMounted } from 'vue';
import { useTodoStore } from 'src/stores/todoStore';
import TodoForm from 'src/components/TodoForm.vue';
import TodoList from 'src/components/TodoList.vue';
import type { TodoFilter } from 'src/types';

const todoStore = useTodoStore();

const filterOptions: { label: string; value: TodoFilter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Выполненные', value: 'completed' },
];

onMounted(() => {
  void todoStore.fetchTodos();
});

async function handleAdd(title: string): Promise<void> {
  await todoStore.addTodo({ title });
}

function handleToggle(id: string): void {
  void todoStore.toggleTodo(id);
}

function handleDelete(id: string): void {
  void todoStore.deleteTodo(id);
}
</script>

<template>
  <div class="column q-gutter-md">
    <div class="text-h5">Мои задачи</div>

    <TodoForm @submit="handleAdd" />

    <div class="row q-gutter-md items-center">
      <q-btn-toggle
        :model-value="todoStore.filter"
        toggle-color="primary"
        :options="filterOptions"
        @update:model-value="todoStore.setFilter($event as TodoFilter)"
      />
      <q-input
        :model-value="todoStore.searchQuery"
        dense
        outlined
        clearable
        label="Поиск"
        class="col-grow"
        @update:model-value="todoStore.setSearchQuery(String($event ?? ''))"
      />
    </div>

    <q-banner v-if="todoStore.error" class="bg-negative text-white rounded-borders">
      {{ todoStore.error }}
    </q-banner>

    <q-inner-loading :showing="todoStore.loading">
      <q-spinner size="42px" color="primary" />
    </q-inner-loading>

    <TodoList
      :todos="todoStore.filteredTodos"
      @toggle="handleToggle"
      @delete="handleDelete"
    />
  </div>
</template>
