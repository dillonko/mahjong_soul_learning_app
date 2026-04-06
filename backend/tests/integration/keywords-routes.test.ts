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

describe('Keywords API Endpoints', () => {
  describe('GET /api/keywords', () => {
    test('should return all keywords ordered alphabetically', async () => {
      const res = await fetch(url('/api/keywords'));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(3);
      expect(body.data[0].term).toBe('Riichi');
      expect(body.data[1].term).toBe('Ron');
      expect(body.data[2].term).toBe('Tsumo');
    });

    test('should filter by category', async () => {
      const res = await fetch(url('/api/keywords?category=gameplay'));
      const body = await res.json();
      expect(body.data.length).toBe(2);
      expect(body.data.every((k: any) => k.category === 'gameplay')).toBe(true);
    });

    test('should return empty array for non-existent category', async () => {
      const res = await fetch(url('/api/keywords?category=nonexistent'));
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  describe('GET /api/keywords/:id', () => {
    test('should return a single keyword', async () => {
      const allRes = await fetch(url('/api/keywords'));
      const allBody = await allRes.json();
      const kwId = allBody.data[0].id;

      const res = await fetch(url(`/api/keywords/${kwId}`));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.id).toBe(kwId);
      expect(body.data.term).toBeDefined();
      expect(body.data.definition).toBeDefined();
    });

    test('should return 404 for non-existent keyword', async () => {
      const res = await fetch(url('/api/keywords/99999'));
      const body = await res.json();
      expect(res.status).toBe(404);
      expect(body.error).toContain('not found');
    });
  });

  describe('POST /api/keywords', () => {
    test('should create a new keyword', async () => {
      const res = await fetch(url('/api/keywords'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          term: 'Dora',
          definition: 'Bonus tiles that increase hand value',
          category: 'scoring',
          examples: 'Red fives, indicator tiles',
        }),
      });
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data.term).toBe('Dora');
    });

    test('should default examples to empty string', async () => {
      const res = await fetch(url('/api/keywords'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          term: 'Kan',
          definition: 'A set of four identical tiles',
          category: 'gameplay',
        }),
      });
      const body = await res.json();
      expect(body.data.examples).toBe('');
    });
  });

  describe('GET /api/keywords/random', () => {
    test('should return random keywords with default count', async () => {
      const res = await fetch(url('/api/keywords/random'));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    test('should respect count parameter', async () => {
      const res = await fetch(url('/api/keywords/random?count=2'));
      const body = await res.json();
      expect(body.data.length).toBe(2);
    });

    test('should return all if count exceeds total', async () => {
      const res = await fetch(url('/api/keywords/random?count=100'));
      const body = await res.json();
      expect(body.data.length).toBe(3);
    });
  });
});
