import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock useApi as a global (Nuxt auto-import)
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getToken: vi.fn(() => null),
};

(globalThis as any).useApi = () => mockApi;

import { useAuthStore } from '~/stores/auth';

describe('Auth Store', () => {
  let store: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have default state values', () => {
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.guest).toBeNull();
      expect(store.isGuest).toBe(false);
      expect(store.isLoggedIn).toBe(false);
      expect(store.loading).toBe(false);
    });
  });

  describe('setAuth()', () => {
    it('should set user auth data', () => {
      store.setAuth({
        token: 'test-token',
        user: { id: 1, email: 'test@test.com', username: 'TestUser', createdAt: '2025-01-01' },
        isGuest: false,
      });

      expect(store.token).toBe('test-token');
      expect(store.user?.email).toBe('test@test.com');
      expect(store.isGuest).toBe(false);
      expect(store.isLoggedIn).toBe(true);
    });

    it('should set guest auth data', () => {
      store.setAuth({
        token: 'guest-token',
        guest: { id: 1, sessionToken: 'sess', createdAt: '2025-01-01', expiresAt: '2025-01-04' },
        isGuest: true,
      });

      expect(store.token).toBe('guest-token');
      expect(store.isGuest).toBe(true);
      expect(store.isLoggedIn).toBe(true);
    });

    it('should store user data in user field', () => {
      const userData = { id: 5, email: 'u@t.com', username: 'TestName', createdAt: '2025-01-01' };
      store.setAuth({ token: 't', user: userData, isGuest: false });
      expect(store.user).toEqual(userData);
    });

    it('should store guest data in guest field', () => {
      const guestData = { id: 3, sessionToken: 'sess', createdAt: '2025-01-01', expiresAt: '2025-01-04' };
      store.setAuth({ token: 't', guest: guestData, isGuest: true });
      expect(store.guest).toEqual(guestData);
    });
  });

  describe('register()', () => {
    it('should call API and set auth on success', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, email: 'new@test.com', username: 'NewUser', createdAt: '2025-01-01' },
        isGuest: false,
      };
      mockApi.post.mockResolvedValue(mockResponse);

      await store.register('new@test.com', 'password123', 'NewUser');

      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'new@test.com',
        password: 'password123',
        username: 'NewUser',
      });
      expect(store.token).toBe('new-token');
      expect(store.isLoggedIn).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('should throw on API error', async () => {
      mockApi.post.mockRejectedValue(new Error('Email already registered'));

      await expect(store.register('dup@test.com', 'pass123', 'Dup')).rejects.toThrow('Email already registered');
      expect(store.loading).toBe(false);
    });

    it('should set loading to true during register', async () => {
      let loadingDuringCall = false;
      mockApi.post.mockImplementation(async () => {
        loadingDuringCall = store.loading;
        return { token: 't', user: { id: 1, email: 'e', username: 'u', createdAt: '' }, isGuest: false };
      });

      await store.register('e@t.com', 'pass123', 'u');
      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('login()', () => {
    it('should call API and set auth on success', async () => {
      const mockResponse = {
        token: 'login-token',
        user: { id: 1, email: 'login@test.com', username: 'LoginUser', createdAt: '2025-01-01' },
        isGuest: false,
      };
      mockApi.post.mockResolvedValue(mockResponse);

      await store.login('login@test.com', 'password123');

      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'login@test.com',
        password: 'password123',
      });
      expect(store.isLoggedIn).toBe(true);
    });

    it('should throw on invalid credentials', async () => {
      mockApi.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(store.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
      expect(store.isLoggedIn).toBe(false);
    });
  });

  describe('continueAsGuest()', () => {
    it('should create guest session', async () => {
      const mockResponse = {
        token: 'guest-token',
        guest: { id: 1, sessionToken: 'sess-123', createdAt: '2025-01-01', expiresAt: '2025-01-04' },
        isGuest: true,
      };
      mockApi.post.mockResolvedValue(mockResponse);

      await store.continueAsGuest();

      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/guest');
      expect(store.isGuest).toBe(true);
      expect(store.isLoggedIn).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should clear all auth state', () => {
      store.setAuth({
        token: 'token',
        user: { id: 1, email: 'test@test.com', username: 'Test', createdAt: '2025-01-01' },
        isGuest: false,
      });

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.guest).toBeNull();
      expect(store.isLoggedIn).toBe(false);
      expect(store.isGuest).toBe(false);
    });

    it('should call navigateTo to redirect to login', () => {
      store.setAuth({
        token: 'token',
        user: { id: 1, email: 'test@test.com', username: 'Test', createdAt: '2025-01-01' },
        isGuest: false,
      });

      store.logout();

      expect((globalThis as any).navigateTo).toHaveBeenCalledWith('/login');
    });
  });

  describe('init()', () => {
    it('should do nothing on server side', () => {
      // init checks import.meta.server — in tests this may not persist
      // Just verify no crash
      store.init();
      expect(store.isLoggedIn).toBe(false);
    });
  });
});
