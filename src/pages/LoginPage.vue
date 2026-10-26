<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ZodType } from 'zod';
import { useUserStore } from 'src/stores/userStore';
import { loginFormSchema, registerFormSchema } from 'src/utils/validation';
import { useValidation } from 'src/composables/useValidation';
import { shouldShowError } from 'src/utils/formHelpers';
import FormError from 'src/components/FormError.vue';

type AuthMode = 'login' | 'register';
type AuthForm = { email: string; password: string; name: string };

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const mode = ref<AuthMode>('login');
const showPassword = ref(false);
const submitted = ref(false);

const schema = computed(
  () =>
    (mode.value === 'register' ? registerFormSchema : loginFormSchema) as unknown as ZodType<AuthForm>,
);

const form = useValidation(schema, { email: '', password: '', name: '' });

let emailTimer: ReturnType<typeof setTimeout> | undefined;

function fieldError(field: keyof AuthForm): string | null {
  const message = form.errors[field];
  const visible = shouldShowError(form.touched, field, message) || (submitted.value && Boolean(message));
  return visible ? (message ?? null) : null;
}

function onField(field: keyof AuthForm, value: string | number | null): void {
  form.values[field] = String(value ?? '');
  form.touched[field] = true;
  form.validateField(field);
  if (field === 'email' && mode.value === 'register') {
    scheduleEmailCheck();
  }
}

function scheduleEmailCheck(): void {
  if (emailTimer) {
    clearTimeout(emailTimer);
  }
  emailTimer = setTimeout(() => {
    void form.ensureEmailAvailable('email');
  }, 300);
}

function switchMode(next: AuthMode): void {
  mode.value = next;
  submitted.value = false;
  userStore.clearError();
  Object.keys(form.errors).forEach((key) => delete form.errors[key]);
}

async function onSubmit(): Promise<void> {
  submitted.value = true;
  if (!form.validateAll()) {
    return;
  }
  if (mode.value === 'register') {
    const unique = await form.ensureEmailAvailable('email');
    if (!unique) {
      return;
    }
    const ok = await userStore.register({
      email: form.values.email,
      password: form.values.password,
      name: form.values.name,
    });
    if (ok) {
      void router.push('/');
    }
    return;
  }

  const ok = await userStore.login({
    email: form.values.email,
    password: form.values.password,
  });
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    void router.push(redirect);
  }
}

onUnmounted(() => {
  if (emailTimer) {
    clearTimeout(emailTimer);
  }
});
</script>

<template>
  <q-form class="column q-gutter-md" @submit.prevent="onSubmit">
    <q-btn-toggle
      :model-value="mode"
      spread
      no-caps
      toggle-color="primary"
      :options="[
        { label: 'Вход', value: 'login' },
        { label: 'Регистрация', value: 'register' },
      ]"
      @update:model-value="switchMode($event as AuthMode)"
    />

    <q-input
      v-if="mode === 'register'"
      :model-value="form.values.name"
      label="Имя"
      outlined
      :error="Boolean(fieldError('name'))"
      @update:model-value="onField('name', $event)"
    />
    <FormError v-if="fieldError('name')" :message="fieldError('name') || ''" />

    <q-input
      :model-value="form.values.email"
      type="email"
      label="Email"
      outlined
      :error="Boolean(fieldError('email'))"
      @update:model-value="onField('email', $event)"
    />
    <FormError v-if="fieldError('email')" :message="fieldError('email') || ''" />

    <q-input
      :model-value="form.values.password"
      :type="showPassword ? 'text' : 'password'"
      label="Пароль"
      outlined
      :error="Boolean(fieldError('password'))"
      @update:model-value="onField('password', $event)"
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <FormError v-if="fieldError('password')" :message="fieldError('password') || ''" />

    <FormError v-if="userStore.error" :message="userStore.error" />

    <q-btn
      type="submit"
      color="primary"
      :label="mode === 'register' ? 'Зарегистрироваться' : 'Войти'"
      :loading="userStore.loading"
    />

    <div v-if="mode === 'login'" class="text-caption text-grey-7">Демо: demo@todo.app / password</div>
  </q-form>
</template>
