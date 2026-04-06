import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mockModules } from '../mocks/api';

// Mock useApi as global
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getToken: vi.fn(() => 'mock-token'),
};

(globalThis as any).useApi = () => mockApi;

import { useProgressStore } from '~/stores/progress';

describe('Module Viewer Integration', () => {
  let progressStore: ReturnType<typeof useProgressStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    progressStore = useProgressStore();
    vi.clearAllMocks();
  });

  describe('Module Content Parsing', () => {
    it('should parse module content JSON correctly', () => {
      const module = mockModules[0];
      const content = JSON.parse(module.content);

      expect(content.sections).toBeDefined();
      expect(content.sections).toBeInstanceOf(Array);
      expect(content.sections[0].title).toBe('Intro');
      expect(content.sections[0].body).toBe('Welcome to Mahjong');
    });

    it('should parse quiz questions correctly', () => {
      const module = mockModules[0];
      const content = JSON.parse(module.content);

      expect(content.quiz).toBeDefined();
      expect(content.quiz[0].question).toBe('How many tiles?');
      expect(content.quiz[0].options).toHaveLength(4);
      expect(content.quiz[0].answer).toBe(0);
    });
  });

  describe('Quiz Scoring Logic', () => {
    it('should calculate correct score percentage', () => {
      const totalQuestions = 5;
      const correctAnswers = 4;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      expect(score).toBe(80);
    });

    it('should handle perfect score', () => {
      const score = Math.round((3 / 3) * 100);
      expect(score).toBe(100);
    });

    it('should handle zero score', () => {
      const score = Math.round((0 / 5) * 100);
      expect(score).toBe(0);
    });
  });

  describe('Progress Saving After Quiz', () => {
    it('should save progress with score after quiz completion', async () => {
      const mockResponse = { id: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '' };
      mockApi.post.mockResolvedValue(mockResponse);

      await progressStore.saveProgress(1, true, 80);

      expect(mockApi.post).toHaveBeenCalledWith('/api/progress', {
        moduleId: 1,
        completed: true,
        score: 80,
      });
    });

    it('should update local progress state after save', async () => {
      const mockResponse = { id: 1, moduleId: 1, completed: true, score: 90, lastAccessed: '' };
      mockApi.post.mockResolvedValue(mockResponse);

      await progressStore.saveProgress(1, true, 90);

      expect(progressStore.items.length).toBe(1);
      expect(progressStore.items[0].score).toBe(90);
    });
  });

  describe('Module Navigation', () => {
    it('should track section progress correctly', () => {
      const totalSections = 5;
      let currentSection = 0;

      currentSection++;
      const percent = Math.round(((currentSection + 1) / totalSections) * 100);
      expect(percent).toBe(40);

      currentSection = totalSections - 1;
      const lastPercent = Math.round(((currentSection + 1) / totalSections) * 100);
      expect(lastPercent).toBe(100);
    });
  });
});
