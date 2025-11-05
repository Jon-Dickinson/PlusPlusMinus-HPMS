import { describe, it, expect } from 'vitest';
import axiosModule from '../axios';

describe('lib/axios', () => {
  it('exports instance and can set/unset Authorization header', () => {
    const { instance, setAuthToken } = axiosModule as any;
    // instance should exist and have defaults
    expect(instance).toBeTruthy();

    // ensure header is not set initially
    delete instance.defaults.headers.common['Authorization'];
    expect(instance.defaults.headers.common['Authorization']).toBeUndefined();

    setAuthToken('abc');
    expect(instance.defaults.headers.common['Authorization']).toBe('Bearer abc');

    setAuthToken(null);
    expect(instance.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
