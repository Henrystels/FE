import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import TodoForm from 'src/components/TodoForm.vue';

const QInputStub = defineComponent({
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  template:
    '<input class="title" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
});

const QFormStub = defineComponent({
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'form',
        {
          onSubmit: (event: Event) => {
            event.preventDefault();
            const handler = attrs.onSubmit as ((e: Event) => void) | undefined;
            handler?.(event);
          },
        },
        slots.default?.(),
      );
  },
});

describe('TodoForm', () => {
  it('does not submit empty title', async () => {
    const wrapper = mount(TodoForm, {
      global: {
        stubs: {
          'q-form': QFormStub,
          'q-input': true,
          'q-btn': true,
        },
      },
    });

    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toContain('Название задачи обязательно');
  });

  it('validates while typing and submits a trimmed title', async () => {
    const wrapper = mount(TodoForm, {
      global: {
        stubs: {
          'q-form': QFormStub,
          'q-input': QInputStub,
          'q-btn': true,
        },
      },
    });

    await wrapper.find('input.title').setValue('   ');
    expect(wrapper.text()).toContain('Название задачи обязательно');
    await wrapper.find('input.title').setValue('  Купить хлеб  ');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')?.[0]).toEqual(['Купить хлеб']);
  });
});

