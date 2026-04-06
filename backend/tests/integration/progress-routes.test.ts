import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { startTestServer, stopTestServer, seedTestData } from '../test-server';
import { url, jsonHeaders, authHeaders, registerUser, createGuest } from '../helpers';

let testModuleId: number;

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  const data = await seedTestData();
  testModuleId = data.modules[0].id;
});

describe('Progress API Endpoints', () => {
  describe('GET /api/progress', () => {
    test('should require authentication', async () => {
      const res = await fetch(url('/api/progress'));
      expect(res.status).toBe(401);
    });

    test('should return empty progress for new user', async () => {
      const { body: regBody } = await registerUser('prog@test.com', 'password123', 'ProgUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/progress'), { headers: authHeaders(token) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data).toEqual([]);
    });

    test('should return progress with module data', async () => {
      const { body: regBody } = await registerUser('prog2@test.com', 'password123', 'User2');
      const token = regBody.data.token;

      await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: true, score: 80 }),
      });

      const res = await fetch(url('/api/progress'), { headers: authHeaders(token) });
      const body = await res.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].completed).toBe(true);
      expect(body.data[0].score).toBe(80);
      expect(body.data[0].module).toBeDefined();
    });
  });

  describe('POST /api/progress', () => {
    test('should create new progress for user', async () => {
      const { body: regBody } = await registerUser('save@test.com', 'password123', 'SaveUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: true, score: 90 }),
      });
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data.completed).toBe(true);
      expect(body.data.score).toBe(90);
    });

    test('should update existing progress', async () => {
      const { body: regBody } = await registerUser('update@test.com', 'password123', 'UpdateUser');
      const token = regBody.data.token;

      await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: false, score: 50 }),
      });

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: true, score: 100 }),
      });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.completed).toBe(true);
      expect(body.data.score).toBe(100);
    });

    test('should work for guest sessions', async () => {
      const { body: guestBody } = await createGuest();
      const token = guestBody.data.token;

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: true, score: 75 }),
      });
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data.completed).toBe(true);
    });

    test('should require moduleId', async () => {
      const { body: regBody } = await registerUser('noid@test.com', 'password123', 'NoIdUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ completed: true }),
      });
      expect(res.status).toBe(400);
    });

    test('should return 404 for non-existent module', async () => {
      const { body: regBody } = await registerUser('nomod@test.com', 'password123', 'NoModUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: 99999 }),
      });
      expect(res.status).toBe(404);
    });

    test('should default completed to false and score to 0', async () => {
      const { body: regBody } = await registerUser('default@test.com', 'password123', 'DefUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId }),
      });
      const body = await res.json();
      expect(body.data.completed).toBe(false);
      expect(body.data.score).toBe(0);
    });
  });

  describe('DELETE /api/progress', () => {
    test('should reset all progress for user', async () => {
      const { body: regBody } = await registerUser('reset@test.com', 'password123', 'ResetUser');
      const token = regBody.data.token;

      await fetch(url('/api/progress'), {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ moduleId: testModuleId, completed: true, score: 80 }),
      });

      const res = await fetch(url('/api/progress'), {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.reset).toBe(true);

      const checkRes = await fetch(url('/api/progress'), { headers: authHeaders(token) });
      const checkBody = await checkRes.json();
      expect(checkBody.data).toEqual([]);
    });

    test('should require authentication', async () => {
      const res = await fetch(url('/api/progress'), { method: 'DELETE' });
      expect(res.status).toBe(401);
    });
  });
});
