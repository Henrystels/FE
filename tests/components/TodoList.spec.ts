import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TodoList from 'src/components/TodoList.vue';
import TodoItem from 'src/components/TodoItem.vue';

const todo = {
  id: '1',
  title: 'Alpha',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('TodoList', () => {
  it('shows empty state', () => {
    const wrapper = mount(TodoList, {
      props: { todos: [] },
      global: {
        stubs: ['q-list', 'q-slide-transition'],
      },
    });
    expect(wrapper.text()).toContain('Задач пока нет');
  });

  it('renders items and forwards events', async () => {
    const wrapper = mount(TodoList, {
      props: { todos: [todo] },
      global: {
        stubs: {
          'q-list': { template: '<div><slot /></div>' },
          'q-slide-transition': { template: '<div><slot /></div>' },
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
          'q-checkbox': true,
          'q-btn': true,
        },
      },
    });

    const item = wrapper.findComponent(TodoItem);
    expect(item.exists()).toBe(true);
    item.vm.$emit('toggle', '1');
    item.vm.$emit('delete', '1');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['1']);
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1']);
  });
});

