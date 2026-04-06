import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockKeywords } from '../mocks/api';

describe('Flashcard System Integration', () => {
  describe('Category Filtering', () => {
    it('should filter keywords by category', () => {
      const category = 'gameplay';
      const filtered = mockKeywords.filter(k => k.category === category);
      expect(filtered.length).toBe(2);
      expect(filtered.every(k => k.category === 'gameplay')).toBe(true);
    });

    it('should show all keywords with no filter', () => {
      const selectedCategory = '';
      const filtered = selectedCategory
        ? mockKeywords.filter(k => k.category === selectedCategory)
        : mockKeywords;
      expect(filtered.length).toBe(3);
    });

    it('should return empty for non-existent category', () => {
      const filtered = mockKeywords.filter(k => k.category === 'nonexistent');
      expect(filtered.length).toBe(0);
    });
  });

  describe('Flashcard Mode', () => {
    it('should shuffle flashcards', () => {
      const keywords = [...mockKeywords];
      const shuffled = keywords.sort(() => Math.random() - 0.5);
      // At least same length
      expect(shuffled.length).toBe(keywords.length);
      // All original items still present
      for (const kw of mockKeywords) {
        expect(shuffled.find(s => s.id === kw.id)).toBeDefined();
      }
    });

    it('should navigate between flashcards', () => {
      const flashcards = [...mockKeywords];
      let index = 0;

      // Next
      index = Math.min(index + 1, flashcards.length - 1);
      expect(index).toBe(1);

      // Next again
      index = Math.min(index + 1, flashcards.length - 1);
      expect(index).toBe(2);

      // Next should not exceed bounds
      index = Math.min(index + 1, flashcards.length - 1);
      expect(index).toBe(2);

      // Previous
      index = Math.max(index - 1, 0);
      expect(index).toBe(1);

      // Previous to start
      index = Math.max(index - 1, 0);
      expect(index).toBe(0);

      // Previous should not go below 0
      index = Math.max(index - 1, 0);
      expect(index).toBe(0);
    });

    it('should track flipped state per card', () => {
      const flippedIds = new Set<number>();

      // Flip card 1
      flippedIds.add(1);
      expect(flippedIds.has(1)).toBe(true);
      expect(flippedIds.has(2)).toBe(false);

      // Unflip card 1 (toggle)
      flippedIds.delete(1);
      expect(flippedIds.has(1)).toBe(false);
    });
  });

  describe('Keyword Data Structure', () => {
    it('should have all required fields', () => {
      for (const kw of mockKeywords) {
        expect(kw.id).toBeDefined();
        expect(kw.term).toBeDefined();
        expect(kw.definition).toBeDefined();
        expect(kw.category).toBeDefined();
        expect(typeof kw.term).toBe('string');
        expect(typeof kw.definition).toBe('string');
      }
    });

    it('should have valid categories', () => {
      const validCategories = ['tiles', 'yaku', 'gameplay', 'scoring', 'strategy'];
      for (const kw of mockKeywords) {
        expect(validCategories).toContain(kw.category);
      }
    });
  });
});
