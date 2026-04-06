import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getToken: vi.fn(() => 'mock-token'),
};

// Override global useApi for this test
(globalThis as any).useApi = () => mockApi;

import { useProgressStore } from '~/stores/progress';

describe('Progress Store', () => {
  let store: ReturnType<typeof useProgressStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useProgressStore();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty items array', () => {
      expect(store.items).toEqual([]);
      expect(store.loading).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should calculate completedCount correctly', () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
        { id: 2, moduleId: 2, completed: false, score: 0, lastAccessed: '' },
        { id: 3, moduleId: 3, completed: true, score: 90, lastAccessed: '' },
      ];

      expect(store.completedCount).toBe(2);
    });

    it('should return 0 completedCount when no items', () => {
      expect(store.completedCount).toBe(0);
    });

    it('should calculate totalModules from items length', () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
        { id: 2, moduleId: 2, completed: false, score: 0, lastAccessed: '' },
      ];

      expect(store.totalModules).toBe(2);
    });

    it('should calculate overallScore as average', () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
        { id: 2, moduleId: 2, completed: true, score: 100, lastAccessed: '' },
      ];

      expect(store.overallScore).toBe(90);
    });

    it('should return 0 overallScore when no items', () => {
      expect(store.overallScore).toBe(0);
    });

    it('should get module progress by moduleId', () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
        { id: 2, moduleId: 2, completed: false, score: 50, lastAccessed: '' },
      ];

      const prog = store.getModuleProgress(1);
      expect(prog).toBeDefined();
      expect(prog?.completed).toBe(true);
      expect(prog?.score).toBe(80);
    });

    it('should return null for non-existent module progress', () => {
      // The store returns null (not undefined) per the code: `|| null`
      expect(store.getModuleProgress(999)).toBeNull();
    });
  });

  describe('fetchProgress()', () => {
    it('should fetch and set progress items', async () => {
      const mockData = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '', module: { id: 1, title: 'Module 1' } },
      ];
      mockApi.get.mockResolvedValue(mockData);

      await store.fetchProgress();

      expect(mockApi.get).toHaveBeenCalledWith('/api/progress');
      expect(store.items.length).toBe(1);
      expect(store.items[0].completed).toBe(true);
    });

    it('should handle fetch errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await store.fetchProgress();

      expect(store.items).toEqual([]);
    });
  });

  describe('saveProgress()', () => {
    it('should save progress and update local state', async () => {
      const mockResponse = { id: 1, moduleId: 1, completed: true, score: 85, lastAccessed: '' };
      mockApi.post.mockResolvedValue(mockResponse);

      await store.saveProgress(1, true, 85);

      expect(mockApi.post).toHaveBeenCalledWith('/api/progress', {
        moduleId: 1,
        completed: true,
        score: 85,
      });
      expect(store.items.length).toBe(1);
    });

    it('should handle save errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Save failed'));

      await expect(store.saveProgress(1, true, 50)).rejects.toThrow('Save failed');
    });
  });

  describe('resetProgress()', () => {
    it('should reset all progress', async () => {
      store.items = [{ id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' }];
      mockApi.del.mockResolvedValue({ reset: true });

      await store.resetProgress();

      expect(mockApi.del).toHaveBeenCalledWith('/api/progress');
      expect(store.items).toEqual([]);
    });
  });
});
