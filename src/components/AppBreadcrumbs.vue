<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const crumbs = computed(() => {
  return route.matched
    .filter((record) => record.meta.breadcrumb)
    .map((record) => ({
      label: String(record.meta.breadcrumb),
      to: record.path ? { path: record.path } : undefined,
    }));
});
</script>

<template>
  <q-breadcrumbs v-if="crumbs.length" class="q-mb-md text-grey-7">
    <q-breadcrumbs-el
      v-for="(crumb, index) in crumbs"
      :key="index"
      :label="crumb.label"
      :to="crumb.to"
    />
  </q-breadcrumbs>
</template>
