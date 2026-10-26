<script setup lang="ts">
import type { ITodoItem } from 'src/types';
import TodoItem from './TodoItem.vue';

defineProps<{
  todos: ITodoItem[];
}>();

const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();
</script>

<template>
  <div v-if="todos.length === 0" class="text-grey-7 q-pa-md text-center">
    Задач пока нет. Добавьте первую!
  </div>
  <q-list v-else bordered separator class="rounded-borders">
    <q-slide-transition v-for="todo in todos" :key="todo.id" appear>
      <div>
        <TodoItem
          :todo="todo"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </q-slide-transition>
  </q-list>
</template>
