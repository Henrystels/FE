<script setup lang="ts">
import { computed } from 'vue';
import type { ITodoItem } from 'src/types';

const props = defineProps<{
  todo: ITodoItem;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();

const formattedDate = computed(() => {
  const date = new Date(props.todo.createdAt);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

function onToggle(): void {
  emit('toggle', props.todo.id);
}

function onDelete(): void {
  emit('delete', props.todo.id);
}
</script>

<template>
  <q-item :class="todo.completed ? 'text-grey-6' : ''">
    <q-item-section avatar>
      <q-checkbox :model-value="todo.completed" @update:model-value="onToggle" />
    </q-item-section>
    <q-item-section>
      <q-item-label :class="todo.completed ? 'text-strike' : ''">
        {{ todo.title }}
      </q-item-label>
      <q-item-label caption>{{ formattedDate }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn flat round dense icon="delete" color="negative" @click="onDelete" />
    </q-item-section>
  </q-item>
</template>
