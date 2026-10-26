import { describe, expect, it } from 'vitest';
import { useApi } from 'src/composables/useApi';
import { useAsync } from 'src/composables/useAsync';

describe('useAsync', () => {
  it('returns a successful result', async () => {
    const state = useAsync<string>();
    const result = await state.execute(async () => 'ok');
    expect(result).toBe('ok');
    expect(state.loading.value).toBe(false);
    expect(state.errorMessage.value).toBeNull();
  });

  it('retries a network error and then succeeds', async () => {
    const state = useAsync<string>();
    let calls = 0;
    const result = await state.execute(async () => {
      calls += 1;
      if (calls === 1) {
        throw { isAxiosError: true, message: 'Network Error' };
      }
      return 'recovered';
    }, 1);
    expect(calls).toBe(2);
    expect(result).toBe('recovered');
  });

  it('exposes a validation message without retrying a business error', async () => {
    const state = useAsync<string>();
    let calls = 0;
    const result = await state.execute(async () => {
      calls += 1;
      throw {
        isAxiosError: true,
        message: 'Request failed',
        response: { status: 422, data: { message: 'Email уже используется' } },
      };
    }, 2);
    expect(calls).toBe(1);
    expect(result).toBeNull();
    expect(state.errorMessage.value).toBe('Email уже используется');
    state.reset();
    expect(state.data.value).toBeNull();
    expect(state.errorMessage.value).toBeNull();
  });
});

describe('useApi', () => {
  it('delegates to the async state', async () => {
    const api = useApi<number>();
    expect(await api.execute(async () => 7)).toBe(7);
  });
});
