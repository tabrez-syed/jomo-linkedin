import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.output/**', '.wxt/**']
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url))
    }
  }
});
