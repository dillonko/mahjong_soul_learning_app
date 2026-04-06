import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import { startTestServer, stopTestServer, seedTestData } from '../test-server';
import { url, jsonHeaders, authHeaders, registerUser, loginUser, createGuest } from '../helpers';

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  await seedTestData();
});

describe('E2E User Workflows', () => {
  describe('Registered User: Register → Login → Fetch Modules → Save Progress → Verify', () => {
    test('complete registered user workflow', async () => {
      // Step 1: Register
      const { res: regRes, body: regBody } = await registerUser('e2e@test.com', 'password123', 'E2EUser');
      expect(regRes.status).toBe(201);
      const token = regBody.data.token;
      expect(token).toBeDefined();

      // Step 2: Login with same credentials
      const { res: loginRes, body: loginBody } = await loginUser('e2e@test.com', 'password123');
      expect(loginRes.status).toBe(200);
      const loginToken = loginBody.data.token;

      // Step 3: Fetch modules
      const modulesRes = await fetch(url('/api/modules'));
      const modulesBody = await modulesRes.json();
      expect(modulesRes.status).toBe(200);
      expect(modulesBody.data.length).toBeGreaterThan(0);
      const moduleId = modulesBody.data[0].id;

      // Step 4: View single module
      const moduleRes = await fetch(url(`/api/modules/${moduleId}`));
      const moduleBody = await moduleRes.json();
      expect(moduleRes.status).toBe(200);
      const content = JSON.parse(moduleBody.data.content);
      expect(content.quiz).toBeArray();

      // Step 5: Save progress (complete module with quiz score)
      const progressRes = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(loginToken),
        body: JSON.stringify({ moduleId, completed: true, score: 85 }),
      });
      expect(progressRes.status).toBe(201);

      // Step 6: Verify progress persisted
      const getProgressRes = await fetch(url('/api/progress'), {
        headers: authHeaders(loginToken),
      });
      const progressBody = await getProgressRes.json();
      expect(progressBody.data.length).toBe(1);
      expect(progressBody.data[0].completed).toBe(true);
      expect(progressBody.data[0].score).toBe(85);
      expect(progressBody.data[0].module.id).toBe(moduleId);

      // Step 7: Verify /api/auth/me works
      const meRes = await fetch(url('/api/auth/me'), { headers: authHeaders(loginToken) });
      const meBody = await meRes.json();
      expect(meBody.data.user.email).toBe('e2e@test.com');
    });
  });

  describe('Guest User: Create Session → Fetch Content → Track Progress', () => {
    test('complete guest workflow', async () => {
      // Step 1: Create guest session
      const { res: guestRes, body: guestBody } = await createGuest();
      expect(guestRes.status).toBe(201);
      const guestToken = guestBody.data.token;

      // Step 2: Fetch all learning content
      const [modulesRes, keywordsRes, strategiesRes] = await Promise.all([
        fetch(url('/api/modules')),
        fetch(url('/api/keywords')),
        fetch(url('/api/strategies')),
      ]);

      const modulesBody = await modulesRes.json();
      const keywordsBody = await keywordsRes.json();
      const strategiesBody = await strategiesRes.json();

      expect(modulesBody.data.length).toBeGreaterThan(0);
      expect(keywordsBody.data.length).toBeGreaterThan(0);
      expect(strategiesBody.data.length).toBeGreaterThan(0);

      // Step 3: Save progress on first module
      const moduleId = modulesBody.data[0].id;
      const saveRes = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(guestToken),
        body: JSON.stringify({ moduleId, completed: true, score: 70 }),
      });
      expect(saveRes.status).toBe(201);

      // Step 4: Verify progress
      const progRes = await fetch(url('/api/progress'), {
        headers: authHeaders(guestToken),
      });
      const progBody = await progRes.json();
      expect(progBody.data.length).toBe(1);
      expect(progBody.data[0].score).toBe(70);

      // Step 5: Verify guest info via /me
      const meRes = await fetch(url('/api/auth/me'), {
        headers: authHeaders(guestToken),
      });
      const meBody = await meRes.json();
      expect(meBody.data.isGuest).toBe(true);
    });
  });

  describe('Complete Module Workflow: Multiple modules → Update Progress → Reset', () => {
    test('complete multi-module workflow', async () => {
      const { body: regBody } = await registerUser('multi@test.com', 'password123', 'MultiUser');
      const token = regBody.data.token;

      // Fetch all modules
      const modulesRes = await fetch(url('/api/modules'));
      const modulesBody = await modulesRes.json();
      const modules = modulesBody.data;

      // Complete each module
      for (const mod of modules) {
        const res = await fetch(url('/api/progress'), {
          method: 'POST',
          headers: authHeaders(token),
          body: JSON.stringify({ moduleId: mod.id, completed: true, score: 90 }),
        });
        const body = await res.json();
        expect(body.success).toBe(true);
      }

      // Verify all progress
      const progRes = await fetch(url('/api/progress'), { headers: authHeaders(token) });
      const progBody = await progRes.json();
      expect(progBody.data.length).toBe(modules.length);
      expect(progBody.data.every((p: any) => p.completed)).toBe(true);

      // Reset progress
      const resetRes = await fetch(url('/api/progress'), {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      const resetBody = await resetRes.json();
      expect(resetBody.data.reset).toBe(true);

      // Verify reset
      const afterResetRes = await fetch(url('/api/progress'), { headers: authHeaders(token) });
      const afterResetBody = await afterResetRes.json();
      expect(afterResetBody.data).toEqual([]);
    });
  });

  describe('Keyword & Strategy Browsing Workflow', () => {
    test('should browse keywords by category and get random flashcards', async () => {
      // Browse all keywords
      const allRes = await fetch(url('/api/keywords'));
      const allBody = await allRes.json();
      expect(allBody.data.length).toBeGreaterThan(0);

      // Filter by category
      const gameplayRes = await fetch(url('/api/keywords?category=gameplay'));
      const gameplayBody = await gameplayRes.json();
      expect(gameplayBody.data.length).toBeGreaterThan(0);

      // Get random flashcards
      const randomRes = await fetch(url('/api/keywords/random?count=2'));
      const randomBody = await randomRes.json();
      expect(randomBody.data.length).toBe(2);

      // View individual keyword
      const kwId = allBody.data[0].id;
      const singleRes = await fetch(url(`/api/keywords/${kwId}`));
      const singleBody = await singleRes.json();
      expect(singleBody.data.term).toBeDefined();
      expect(singleBody.data.definition).toBeDefined();
    });

    test('should browse strategies by difficulty', async () => {
      // Browse all strategies
      const allRes = await fetch(url('/api/strategies'));
      const allBody = await allRes.json();
      expect(allBody.data.length).toBeGreaterThan(0);

      // Filter by difficulty
      const beginnerRes = await fetch(url('/api/strategies?difficulty=beginner'));
      const beginnerBody = await beginnerRes.json();
      expect(beginnerBody.data.every((s: any) => s.difficulty === 'beginner')).toBe(true);

      // View individual strategy with content
      const stratId = allBody.data[0].id;
      const singleRes = await fetch(url(`/api/strategies/${stratId}`));
      const singleBody = await singleRes.json();
      const content = JSON.parse(singleBody.data.content);
      expect(content.overview).toBeDefined();
    });
  });

  describe('Progress Isolation Between Users', () => {
    test('progress should be isolated between different users', async () => {
      // Register two users
      const { body: user1Body } = await registerUser('user1@test.com', 'password123', 'User1');
      const { body: user2Body } = await registerUser('user2@test.com', 'password123', 'User2');
      const token1 = user1Body.data.token;
      const token2 = user2Body.data.token;

      const modulesRes = await fetch(url('/api/modules'));
      const modulesBody = await modulesRes.json();
      const moduleId = modulesBody.data[0].id;

      // User 1 saves progress
      await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token1),
        body: JSON.stringify({ moduleId, completed: true, score: 100 }),
      });

      // User 2 should have no progress
      const prog2Res = await fetch(url('/api/progress'), { headers: authHeaders(token2) });
      const prog2Body = await prog2Res.json();
      expect(prog2Body.data).toEqual([]);

      // User 1 should have progress
      const prog1Res = await fetch(url('/api/progress'), { headers: authHeaders(token1) });
      const prog1Body = await prog1Res.json();
      expect(prog1Body.data.length).toBe(1);
    });
  });
});
