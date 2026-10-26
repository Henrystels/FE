import type { Router } from 'vue-router';
import { useUserStore } from 'src/stores/userStore';
import type { AppRouteMeta } from 'src/types';
import { logError } from 'src/utils/errorHandling';

export function registerRouterGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore();
    if (!userStore.user && localStorage.getItem('todo_access_token')) {
      await userStore.restoreSession();
    }

    const meta = to.meta as AppRouteMeta;

    if (meta.requiresAuth && !userStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    if (meta.guestOnly && userStore.isAuthenticated) {
      next({ name: 'home' });
      return;
    }

    const title = to.meta.title;
    if (typeof title === 'string') {
      document.title = `${title} | Todo App`;
    }

    next();
  });

  router.onError((error) => {
    logError(error, 'router');
  });
}
