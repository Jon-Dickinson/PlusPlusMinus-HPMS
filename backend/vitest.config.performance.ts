/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/performance/**/*.test.ts'],
    testTimeout: 60000, // 60 seconds for performance tests
    hookTimeout: 120000, // 2 minutes for hooks
  },
});