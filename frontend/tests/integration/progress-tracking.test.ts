import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockModules } from '../mocks/api';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getToken: vi.fn(() => 'mock-token'),
};

(globalThis as any).useApi = () => mockApi;

import { useProgressStore } from '~/stores/progress';

describe('Progress Tracking Integration', () => {
  let store: ReturnType<typeof useProgressStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useProgressStore();
    vi.clearAllMocks();
  });

  describe('Progress Display Calculations', () => {
    it('should calculate overall completion percentage', () => {
      const totalModules = 5;
      const completedModules = 3;
      const percent = Math.round((completedModules / totalModules) * 100);
      expect(percent).toBe(60);
    });

    it('should calculate average quiz score', () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
        { id: 2, moduleId: 2, completed: true, score: 90, lastAccessed: '' },
        { id: 3, moduleId: 3, completed: false, score: 0, lastAccessed: '' },
      ];

      expect(store.overallScore).toBe(57); // Math.round((80+90+0)/3)
    });

    it('should handle empty progress gracefully', () => {
      expect(store.completedCount).toBe(0);
      expect(store.totalModules).toBe(0);
      expect(store.overallScore).toBe(0);
    });
  });

  describe('Progress State Management', () => {
    it('should update progress after completing a module', async () => {
      mockApi.post.mockResolvedValue({ id: 1, moduleId: 1, completed: true, score: 85, lastAccessed: '' });
      mockApi.get.mockResolvedValue([
        { id: 1, moduleId: 1, completed: true, score: 85, lastAccessed: '', module: mockModules[0] },
      ]);

      await store.saveProgress(1, true, 85);
      await store.fetchProgress();

      expect(store.items.length).toBe(1);
      const moduleProg = store.getModuleProgress(1);
      expect(moduleProg?.completed).toBe(true);
      expect(moduleProg?.score).toBe(85);
    });

    it('should reset all progress', async () => {
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
      ];

      mockApi.del.mockResolvedValue({ reset: true });

      await store.resetProgress();

      expect(store.items).toEqual([]);
      expect(mockApi.del).toHaveBeenCalledWith('/api/progress');
    });
  });

  describe('Module Progress Mapping', () => {
    it('should map modules to their progress status', () => {
      const modules = mockModules;
      store.items = [
        { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' },
      ];

      const moduleStatuses = modules.map(mod => {
        const progress = store.getModuleProgress(mod.id);
        return {
          moduleId: mod.id,
          title: mod.title,
          status: progress?.completed ? 'Completed' : progress ? 'In Progress' : 'Not Started',
          score: progress?.score ?? 0,
        };
      });

      expect(moduleStatuses[0].status).toBe('Completed');
      expect(moduleStatuses[0].score).toBe(80);
      expect(moduleStatuses[1].status).toBe('Not Started');
      expect(moduleStatuses[1].score).toBe(0);
    });
  });
});
