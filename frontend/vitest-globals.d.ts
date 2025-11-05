// Ambient globals for the editor / TypeScript language server to pick up
// This file re-declares the common Vitest globals as true globals so editors
// that don't pick up triple-slash references will still recognize them.

import type { beforeAll as _beforeAll, afterAll as _afterAll, beforeEach as _beforeEach, afterEach as _afterEach } from 'vitest';

declare global {
  // test structure
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const test: typeof import('vitest').test;

  // assertions & spies
  const expect: typeof import('vitest').expect;
  const vi: typeof import('vitest').vi;

  // lifecycle hooks
  const beforeAll: typeof _beforeAll;
  const afterAll: typeof _afterAll;
  const beforeEach: typeof _beforeEach;
  const afterEach: typeof _afterEach;
}

export {};
