<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from 'src/stores/uiStore';
import { useUserStore } from 'src/stores/userStore';
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue';

const ui = useUiStore();
const userStore = useUserStore();
const router = useRouter();

const userName = computed(() => userStore.user?.name ?? 'Пользователь');

function goSettings(): void {
  void router.push({ name: 'settings' });
}

function logout(): void {
  userStore.logout();
  void router.push({ name: 'login' });
}
</script>

<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Меню" @click="ui.setDrawer(!ui.drawerOpen)" />
        <q-toolbar-title>Todo App</q-toolbar-title>
        <q-btn flat round dense :icon="ui.theme === 'dark' ? 'light_mode' : 'dark_mode'" @click="ui.toggleTheme()" />
        <q-btn flat label="Выйти" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="ui.drawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header>{{ userName }}</q-item-label>
        <q-item clickable v-ripple :to="{ name: 'home' }" exact>
          <q-item-section avatar><q-icon name="checklist" /></q-item-section>
          <q-item-section>Задачи</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="goSettings">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Настройки</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <AppBreadcrumbs />
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
