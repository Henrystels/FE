import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import NotFoundPage from 'src/pages/NotFoundPage.vue';

describe('NotFoundPage', () => {
  it('shows the missing page message inside a layout', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>home</div>' } },
        { path: '/404', component: NotFoundPage },
      ],
    });
    await router.push('/404');
    await router.isReady();

    const wrapper = mount(NotFoundPage, {
      global: {
        plugins: [router],
        stubs: {
          'q-layout': { template: '<div class="layout"><slot /></div>' },
          'q-page-container': { template: '<div><slot /></div>' },
          'q-page': { template: '<main><slot /></main>' },
          'q-btn': { props: ['label'], template: '<button>{{ label }}</button>' },
        },
      },
    });

    expect(wrapper.find('.layout').exists()).toBe(true);
    expect(wrapper.text()).toContain('404');
    expect(wrapper.text()).toContain('Страница не найдена');
    expect(wrapper.text()).toContain('На главную');
  });
});