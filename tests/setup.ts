import { afterEach } from 'vitest';
import { config } from '@vue/test-utils';

config.global.stubs = {
  transition: false,
  'transition-group': false,
};

afterEach(() => {
  localStorage.clear();
});
