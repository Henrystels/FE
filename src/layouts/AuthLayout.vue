<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageTitle = computed(() => {
  const title = route.meta.title;
  return typeof title === 'string' ? title : 'Todo App';
});
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2 q-pa-md">
        <div class="row justify-center full-width">
        <q-card flat bordered class="q-pa-lg col-12 col-sm-8 col-md-5 col-lg-4">
          <q-card-section class="text-h6 text-center">{{ pageTitle }}</q-card-section>
          <q-card-section>
            <router-view />
          </q-card-section>
        </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
