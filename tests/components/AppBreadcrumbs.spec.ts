import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue';

describe('AppBreadcrumbs', () => {
  it('shows the breadcrumb from the current route', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div />' },
          meta: { breadcrumb: 'Главная' },
        },
      ],
    });
    await router.push('/');
    await router.isReady();

    const wrapper = mount(AppBreadcrumbs, {
      global: {
        plugins: [router],
        stubs: {
          'q-breadcrumbs': { template: '<nav><slot /></nav>' },
          'q-breadcrumbs-el': { props: ['label'], template: '<span>{{ label }}</span>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Главная');
  });
});
