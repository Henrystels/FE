import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import TodoItem from 'src/components/TodoItem.vue';

const QCheckbox = defineComponent({
  emits: ['update:model-value'],
  template: '<button class="check" @click="$emit(\'update:model-value\', true)" />',
});

const QBtn = defineComponent({
  emits: ['click'],
  template: '<button class="del" @click="$emit(\'click\')" />',
});

describe('TodoItem', () => {
  it('renders the date and emits toggle and delete', async () => {
    const todo = {
      id: '1',
      title: 'Sample',
      completed: true,
      createdAt: '2026-03-01T00:00:00.000Z',
    };
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: {
        stubs: {
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
          'q-checkbox': QCheckbox,
          'q-btn': QBtn,
        },
      },
    });

    expect(wrapper.text()).toContain('Sample');
    expect(wrapper.text()).toContain('01/03/2026');
    await wrapper.find('.check').trigger('click');
    await wrapper.find('.del').trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['1']);
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1']);
  });
});

