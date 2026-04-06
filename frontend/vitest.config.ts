import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,vue}'],
      exclude: ['app/assets/**', 'node_modules/**'],
    },
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '@': resolve(__dirname, 'app'),
      '#app': resolve(__dirname, 'tests/mocks/nuxt-app.ts'),
      '#imports': resolve(__dirname, 'tests/mocks/nuxt-imports.ts'),
    },
  },
});
