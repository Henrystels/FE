import { defineStore } from '#q-app';
import { createPinia } from 'pinia';

export { useTodoStore } from './todoStore';
export { useUserStore } from './userStore';
export { useUiStore } from './uiStore';

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // custom pinia plugins
  }
}

export default defineStore(() => {
  const pinia = createPinia();
  return pinia;
});
