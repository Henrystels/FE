<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome(): void {
  void router.push({ name: 'home' });
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center column q-gutter-md">
        <div class="text-h4">404</div>
        <div class="text-body1 text-grey-7">Страница не найдена</div>
        <q-btn color="primary" label="На главную" @click="goHome" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
