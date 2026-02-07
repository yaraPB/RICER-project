import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['./tests/e2e/**', './tests/performance/**', './node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/errors/**', 'src/lib/observability/**'],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 80,
        statements: 95,
      },
    },
  },
});
