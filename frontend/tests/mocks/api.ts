/**
 * Mock API responses for frontend tests.
 */
import { vi } from 'vitest';

export const mockModules = [
  {
    id: 1,
    title: 'Module 1: Basics',
    description: 'Learn the basics of Mahjong',
    order: 1,
    content: JSON.stringify({
      sections: [{ title: 'Intro', body: 'Welcome to Mahjong' }],
      quiz: [{ question: 'How many tiles?', options: ['136', '100', '52', '200'], answer: 0 }],
    }),
    type: 'lesson',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Module 2: Yaku',
    description: 'Learn winning hands',
    order: 2,
    content: JSON.stringify({
      sections: [{ title: 'Yaku Intro', body: 'Yaku are winning patterns' }],
      quiz: [{ question: 'What is Riichi?', options: ['A yaku', 'A tile', 'A rule', 'A score'], answer: 0 }],
    }),
    type: 'lesson',
    createdAt: '2025-01-02T00:00:00.000Z',
  },
];

export const mockKeywords = [
  { id: 1, term: 'Riichi', definition: 'A declaration of readiness', category: 'yaku', examples: 'Declare when tenpai' },
  { id: 2, term: 'Tsumo', definition: 'Self-draw win', category: 'gameplay', examples: 'Draw the winning tile yourself' },
  { id: 3, term: 'Ron', definition: 'Win by discard', category: 'gameplay', examples: "Claim another player's discard" },
];

export const mockStrategies = [
  {
    id: 1,
    title: 'Beginner Defense',
    description: 'Basic defensive play',
    difficulty: 'beginner',
    content: JSON.stringify({ overview: 'Stay safe', steps: ['Watch discards'], tips: ['Be cautious'] }),
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Advanced Offense',
    description: 'Aggressive winning strategy',
    difficulty: 'advanced',
    content: JSON.stringify({ overview: 'Push for wins', steps: ['Read hands'], tips: ['Be bold'] }),
    createdAt: '2025-01-02T00:00:00.000Z',
  },
];

export const mockProgress = [
  { id: 1, userId: 1, moduleId: 1, completed: true, score: 80, lastAccessed: '2025-01-01T00:00:00.000Z', module: mockModules[0] },
];

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'TestUser',
  createdAt: '2025-01-01T00:00:00.000Z',
};

export const mockAuthResponse = {
  token: 'mock-jwt-token',
  user: mockUser,
  isGuest: false,
};

export const mockGuestResponse = {
  token: 'mock-guest-token',
  guest: {
    id: 1,
    sessionToken: 'mock-session-token',
    createdAt: '2025-01-01T00:00:00.000Z',
    expiresAt: '2025-01-04T00:00:00.000Z',
  },
  isGuest: true,
};

/**
 * Create a mock useApi composable for testing.
 */
export function createMockApi() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    getToken: vi.fn(() => 'mock-token'),
  };
}
