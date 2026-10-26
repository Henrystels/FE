import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import FormError from 'src/components/FormError.vue';

describe('FormError', () => {
  it('renders a message and stays quiet without one', () => {
    const shown = mount(FormError, { props: { message: 'Ошибка' } });
    expect(shown.text()).toBe('Ошибка');
    const hidden = mount(FormError);
    expect(hidden.text()).toBe('');
  });
});
