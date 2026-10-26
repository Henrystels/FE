import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/components/**/*.vue',
        'src/composables/**/*.ts',
        'src/services/**/*.ts',
        'src/stores/todoStore.ts',
        'src/stores/userStore.ts',
        'src/stores/uiStore.ts',
        'src/utils/**/*.ts',
        'src/pages/NotFoundPage.vue',
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
