/**
 * Mocks for #app (Nuxt auto-imports).
 */
import { ref, computed } from 'vue';

export const useRuntimeConfig = () => ({
  public: {
    apiBase: 'http://localhost:3001',
  },
});

export const navigateTo = (path: string) => {
  // no-op in tests
  return Promise.resolve();
};

export const useRoute = () => ({
  params: {},
  query: {},
  path: '/',
  fullPath: '/',
});

export const useRouter = () => ({
  push: (path: string) => Promise.resolve(),
  replace: (path: string) => Promise.resolve(),
  back: () => {},
});

export const definePageMeta = (meta: any) => {};

export { ref, computed };
