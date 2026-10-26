<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { useUiStore } from 'src/stores/uiStore';

const userStore = useUserStore();
const ui = useUiStore();

const emailNotifications = computed({
  get: () => userStore.settings.emailNotifications,
  set: (value: boolean) => userStore.updateSettings({ emailNotifications: value }),
});
</script>

<template>
  <div class="row justify-center">
    <div class="column q-gutter-lg col-12 col-sm-10 col-md-6">
    <div class="text-h5">Настройки</div>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Профиль</div>
        <div class="text-body2">{{ userStore.user?.name }}</div>
        <div class="text-caption text-grey-7">{{ userStore.user?.email }}</div>
      </q-card-section>
    </q-card>

    <q-toggle v-model="emailNotifications" label="Email-уведомления" />

    <q-btn
      outline
      color="primary"
      :label="ui.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
      @click="ui.toggleTheme()"
    />
    </div>
  </div>
</template>
