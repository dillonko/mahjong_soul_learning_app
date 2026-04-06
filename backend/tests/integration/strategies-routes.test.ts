import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { startTestServer, stopTestServer, seedTestData } from '../test-server';
import { url, jsonHeaders } from '../helpers';

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  await seedTestData();
});

describe('Strategies API Endpoints', () => {
  describe('GET /api/strategies', () => {
    test('should return all strategies', async () => {
      const res = await fetch(url('/api/strategies'));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2);
    });

    test('should filter by difficulty', async () => {
      const res = await fetch(url('/api/strategies?difficulty=beginner'));
      const body = await res.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].difficulty).toBe('beginner');
    });

    test('should filter by advanced difficulty', async () => {
      const res = await fetch(url('/api/strategies?difficulty=advanced'));
      const body = await res.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].difficulty).toBe('advanced');
    });

    test('should return empty for non-existent difficulty', async () => {
      const res = await fetch(url('/api/strategies?difficulty=expert'));
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  describe('GET /api/strategies/:id', () => {
    test('should return a single strategy', async () => {
      const allRes = await fetch(url('/api/strategies'));
      const allBody = await allRes.json();
      const stratId = allBody.data[0].id;

      const res = await fetch(url(`/api/strategies/${stratId}`));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.id).toBe(stratId);
    });

    test('should return 404 for non-existent strategy', async () => {
      const res = await fetch(url('/api/strategies/99999'));
      expect(res.status).toBe(404);
    });

    test('should have parseable JSON content', async () => {
      const allRes = await fetch(url('/api/strategies'));
      const allBody = await allRes.json();
      const stratId = allBody.data[0].id;

      const res = await fetch(url(`/api/strategies/${stratId}`));
      const body = await res.json();
      const content = JSON.parse(body.data.content);
      expect(content.overview).toBeDefined();
      expect(content.steps).toBeArray();
    });
  });

  describe('POST /api/strategies', () => {
    test('should create a new strategy', async () => {
      const res = await fetch(url('/api/strategies'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          title: 'Mid-Game Strategy',
          description: 'Strategy for the middle of the game',
          difficulty: 'intermediate',
          content: JSON.stringify({ overview: 'Adapt', steps: ['Watch'], tips: ['Think'] }),
        }),
      });
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data.title).toBe('Mid-Game Strategy');
      expect(body.data.difficulty).toBe('intermediate');
    });

    test('should default difficulty to beginner', async () => {
      const res = await fetch(url('/api/strategies'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          title: 'Default Diff',
          description: 'No difficulty specified',
          content: '{}',
        }),
      });
      const body = await res.json();
      expect(body.data.difficulty).toBe('beginner');
    });
  });
});
