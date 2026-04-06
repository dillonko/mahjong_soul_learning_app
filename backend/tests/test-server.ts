/**
 * Shared test server that starts once and is reused across integration/e2e tests.
 */
import { PrismaClient } from '@prisma/client';

// Override env before any imports
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.CORS_ORIGIN = 'http://localhost:3000';

export const testPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});

export async function cleanDatabase() {
  await testPrisma.progress.deleteMany();
  await testPrisma.guestSession.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.module.deleteMany();
  await testPrisma.keyword.deleteMany();
  await testPrisma.strategy.deleteMany();
}

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
      data: { term: 'Ron', definition: 'Win by discard', category: 'gameplay', examples: "Claim another player's discard" },
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

let server: any = null;
let serverPort = 0;

export async function startTestServer(): Promise<number> {
  if (server) return serverPort;

  // Push schema
  const proc = Bun.spawn(['bunx', 'prisma', 'db', 'push', '--force-reset', '--skip-generate'], {
    cwd: import.meta.dir + '/..',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  await proc.exited;

  const { handleAuth } = await import('../src/routes/auth');
  const { handleModules } = await import('../src/routes/modules');
  const { handleProgress } = await import('../src/routes/progress');
  const { handleKeywords } = await import('../src/routes/keywords');
  const { handleStrategies } = await import('../src/routes/strategies');
  const { error: errorResp } = await import('../src/utils/response');

  server = Bun.serve({
    port: 0, // auto-assign port
    async fetch(req: Request) {
      const u = new URL(req.url);
      const path = u.pathname;
      if (path.startsWith('/api/auth')) return handleAuth(req, path);
      if (path.startsWith('/api/modules')) return handleModules(req, path);
      if (path.startsWith('/api/progress')) return handleProgress(req, path);
      if (path.startsWith('/api/keywords')) return handleKeywords(req, path);
      if (path.startsWith('/api/strategies')) return handleStrategies(req, path);
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return errorResp('Not found', 404);
    },
  });

  serverPort = server.port;
  return serverPort;
}

export async function stopTestServer() {
  if (server) {
    server.stop();
    server = null;
  }
  await testPrisma.$disconnect();
}

export function getBaseUrl(): string {
  return `http://localhost:${serverPort}`;
}
