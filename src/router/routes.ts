import type { RouteRecordRaw } from 'vue-router';
import type { AppRouteMeta } from 'src/types';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/IndexPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Задачи',
          breadcrumb: 'Главная',
        } satisfies AppRouteMeta,
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('src/pages/SettingsPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Настройки',
          breadcrumb: 'Настройки',
        } satisfies AppRouteMeta,
      },
    ],
  },
  {
    path: '/login',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('src/pages/LoginPage.vue'),
        meta: {
          guestOnly: true,
          title: 'Вход',
          breadcrumb: 'Вход',
        } satisfies AppRouteMeta,
      },
    ],
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('src/pages/NotFoundPage.vue'),
    meta: { title: 'Страница не найдена' } satisfies AppRouteMeta,
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'not-found' },
  },
];

export default routes;
