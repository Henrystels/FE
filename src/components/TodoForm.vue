<script setup lang="ts">
import { ref } from 'vue';
import { createTodoSchema } from 'src/utils/validation';
import FormError from './FormError.vue';

const emit = defineEmits<{
  submit: [title: string];
}>();

const title = ref('');
const errorMessage = ref<string | null>(null);
const touched = ref(false);

function validateTitle(value: string): boolean {
  const result = createTodoSchema.safeParse({ title: value });
  if (!result.success) {
    errorMessage.value = result.error.issues[0]?.message ?? 'Ошибка валидации';
    return false;
  }
  errorMessage.value = null;
  return true;
}

function onTitle(value: string | number | null): void {
  title.value = String(value ?? '');
  touched.value = true;
  validateTitle(title.value);
}

function handleSubmit(): void {
  touched.value = true;
  if (!validateTitle(title.value)) {
    return;
  }
  emit('submit', title.value.trim());
  title.value = '';
  touched.value = false;
  errorMessage.value = null;
}
</script>

<template>
  <q-form class="row q-gutter-sm items-start" @submit.prevent="handleSubmit">
    <div class="col-grow">
      <q-input
        :model-value="title"
        label="Новая задача"
        dense
        outlined
        :error="touched && Boolean(errorMessage)"
        @update:model-value="onTitle"
      />
      <FormError v-if="touched && errorMessage" :message="errorMessage" />
    </div>
    <q-btn type="submit" color="primary" icon="add" label="Добавить" />
  </q-form>
</template>
