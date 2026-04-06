/**
 * Vitest setup file: mocks Nuxt auto-imports, localStorage, etc.
 */
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock import.meta properties for Nuxt
Object.defineProperty(import.meta, 'client', { value: true, writable: true });
Object.defineProperty(import.meta, 'server', { value: false, writable: true });

// Stub Nuxt auto-imports as globals
// useRuntimeConfig
(globalThis as any).useRuntimeConfig = () => ({
  public: { apiBase: 'http://localhost:3001' },
});

// navigateTo
(globalThis as any).navigateTo = vi.fn(() => Promise.resolve());

// useRoute
(globalThis as any).useRoute = () => ({
  params: {},
  query: {},
  path: '/',
  fullPath: '/',
});

// useRouter
(globalThis as any).useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
});

// definePageMeta
(globalThis as any).definePageMeta = vi.fn();

// $fetch mock (used by useApi)
(globalThis as any).$fetch = vi.fn();
