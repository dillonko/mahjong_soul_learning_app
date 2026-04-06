/**
 * Test setup: configures a separate test database and provides
 * helpers for seeding / cleaning between tests.
 */
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'bun:test';

// Override DATABASE_URL to use a separate test database
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.PORT = '3099';

export const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});

/**
 * Clean all tables in correct order (respects FK constraints).
 */
export async function cleanDatabase() {
  await testPrisma.progress.deleteMany();
  await testPrisma.guestSession.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.module.deleteMany();
  await testPrisma.keyword.deleteMany();
  await testPrisma.strategy.deleteMany();
}

/**
 * Seed minimal fixture data for integration tests.
 */
export async function seedTestData() {
  await cleanDatabase();

  const modules = await Promise.all([
    testPrisma.module.create({
      data: {
        title: 'Module 1: Basics',
        description: 'Learn the basics of Mahjong',
        order: 1,
        content: JSON.stringify({
          sections: [{ title: 'Intro', body: 'Welcome to Mahjong' }],
          quiz: [{ question: 'How many tiles?', options: ['136', '100', '52', '200'], answer: 0 }],
        }),
        type: 'lesson',
      },
    }),
    testPrisma.module.create({
      data: {
        title: 'Module 2: Yaku',
        description: 'Learn winning hands',
        order: 2,
        content: JSON.stringify({
          sections: [{ title: 'Yaku Intro', body: 'Yaku are winning patterns' }],
          quiz: [{ question: 'What is Riichi?', options: ['A yaku', 'A tile', 'A rule', 'A score'], answer: 0 }],
        }),
        type: 'lesson',
      },
    }),
  ]);

  const keywords = await Promise.all([
    testPrisma.keyword.create({
      data: { term: 'Riichi', definition: 'A declaration of readiness', category: 'yaku', examples: 'Declare when tenpai' },
    }),
    testPrisma.keyword.create({
      data: { term: 'Tsumo', definition: 'Self-draw win', category: 'gameplay', examples: 'Draw the winning tile yourself' },
    }),
    testPrisma.keyword.create({
      data: { term: 'Ron', definition: 'Win by discard', category: 'gameplay', examples: 'Claim another player\'s discard' },
    }),
  ]);

  const strategies = await Promise.all([
    testPrisma.strategy.create({
      data: {
        title: 'Beginner Defense',
        description: 'Basic defensive play',
        difficulty: 'beginner',
        content: JSON.stringify({ overview: 'Stay safe', steps: ['Watch discards'], tips: ['Be cautious'] }),
      },
    }),
    testPrisma.strategy.create({
      data: {
        title: 'Advanced Offense',
        description: 'Aggressive winning strategy',
        difficulty: 'advanced',
        content: JSON.stringify({ overview: 'Push for wins', steps: ['Read hands'], tips: ['Be bold'] }),
      },
    }),
  ]);

  return { modules, keywords, strategies };
}
