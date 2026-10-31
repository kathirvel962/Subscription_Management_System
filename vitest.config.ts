import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['members/**/tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@members': path.resolve(__dirname, './members'),
      '@server': path.resolve(__dirname, './server/src'),
      '@client': path.resolve(__dirname, './client/src'),
    },
  },
});
