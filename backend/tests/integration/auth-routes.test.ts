import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { startTestServer, stopTestServer, cleanDatabase } from '../test-server';
import { url, jsonHeaders, authHeaders, registerUser, loginUser, createGuest } from '../helpers';

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  await cleanDatabase();
});

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const { res, body } = await registerUser('test@example.com', 'password123', 'TestUser');
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.user.email).toBe('test@example.com');
      expect(body.data.user.username).toBe('TestUser');
      expect(body.data.isGuest).toBe(false);
    });

    test('should fail with missing fields', async () => {
      const res = await fetch(url('/api/auth/register'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });

    test('should fail with short password', async () => {
      const { res, body } = await registerUser('test@test.com', '12345', 'User');
      expect(res.status).toBe(400);
      expect(body.error).toContain('at least 6');
    });

    test('should fail with duplicate email', async () => {
      await registerUser('dup@test.com', 'password123', 'User1');
      const { res, body } = await registerUser('dup@test.com', 'password123', 'User2');
      expect(res.status).toBe(409);
      expect(body.error).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login an existing user', async () => {
      await registerUser('login@test.com', 'password123', 'LoginUser');
      const { res, body } = await loginUser('login@test.com', 'password123');
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.user.email).toBe('login@test.com');
    });

    test('should fail with wrong password', async () => {
      await registerUser('wrong@test.com', 'correctpass', 'User');
      const { res, body } = await loginUser('wrong@test.com', 'incorrectpass');
      expect(res.status).toBe(401);
      expect(body.error).toContain('Invalid credentials');
    });

    test('should fail with non-existent email', async () => {
      const { res, body } = await loginUser('nonexistent@test.com', 'password');
      expect(res.status).toBe(401);
      expect(body.error).toContain('Invalid credentials');
    });

    test('should fail with missing fields', async () => {
      const res = await fetch(url('/api/auth/login'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/guest', () => {
    test('should create a guest session', async () => {
      const { res, body } = await createGuest();
      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.guest).toBeDefined();
      expect(body.data.guest.sessionToken).toBeDefined();
      expect(body.data.isGuest).toBe(true);
    });

    test('should create unique sessions each time', async () => {
      const { body: b1 } = await createGuest();
      const { body: b2 } = await createGuest();
      expect(b1.data.guest.sessionToken).not.toBe(b2.data.guest.sessionToken);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user info with valid user token', async () => {
      const { body: regBody } = await registerUser('me@test.com', 'password123', 'MeUser');
      const token = regBody.data.token;

      const res = await fetch(url('/api/auth/me'), { headers: authHeaders(token) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.user.email).toBe('me@test.com');
      expect(body.data.isGuest).toBe(false);
    });

    test('should return guest info with valid guest token', async () => {
      const { body: guestBody } = await createGuest();
      const token = guestBody.data.token;

      const res = await fetch(url('/api/auth/me'), { headers: authHeaders(token) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.isGuest).toBe(true);
      expect(body.data.guest).toBeDefined();
    });

    test('should fail without authentication', async () => {
      const res = await fetch(url('/api/auth/me'));
      expect(res.status).toBe(401);
    });

    test('should fail with invalid token', async () => {
      const res = await fetch(url('/api/auth/me'), { headers: authHeaders('bad-token') });
      expect(res.status).toBe(401);
    });
  });
});
