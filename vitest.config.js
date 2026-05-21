import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentMatchGlobs: [['tests/search-benchmark.test.js', 'node']],
    globals: true,
    setupFiles: ['tests/setup.js'],
    include: ['tests/**/*.test.js'],
  },
});
