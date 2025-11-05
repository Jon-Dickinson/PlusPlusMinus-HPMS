import { vi } from 'vitest';

export function mockNextRouter({ pathname = '/', push = vi.fn() } = {}) {
  vi.mock('next/router', () => ({ useRouter: () => ({ pathname, push }) }));
  return { push };
}

export default mockNextRouter;
