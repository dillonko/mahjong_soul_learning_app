import { describe, test, expect } from 'bun:test';
import { success, error, parseBody } from '../../src/utils/response';

describe('Response Utilities', () => {
  describe('success()', () => {
    test('should return JSON response with success: true', async () => {
      const res = success({ message: 'hello' });
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('hello');
    });

    test('should default to status 200', () => {
      const res = success('data');
      expect(res.status).toBe(200);
    });

    test('should accept custom status code', () => {
      const res = success('created', 201);
      expect(res.status).toBe(201);
    });

    test('should set Content-Type to application/json', () => {
      const res = success(null);
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });

    test('should handle null data', async () => {
      const res = success(null);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });

    test('should handle array data', async () => {
      const res = success([1, 2, 3]);
      const body = await res.json();
      expect(body.data).toEqual([1, 2, 3]);
    });

    test('should handle nested object data', async () => {
      const data = { user: { name: 'test', items: [1, 2] } };
      const res = success(data);
      const body = await res.json();
      expect(body.data).toEqual(data);
    });
  });

  describe('error()', () => {
    test('should return JSON response with success: false', async () => {
      const res = error('Something went wrong');
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Something went wrong');
    });

    test('should default to status 400', () => {
      const res = error('bad request');
      expect(res.status).toBe(400);
    });

    test('should accept custom status codes', () => {
      expect(error('not found', 404).status).toBe(404);
      expect(error('unauthorized', 401).status).toBe(401);
      expect(error('server error', 500).status).toBe(500);
      expect(error('conflict', 409).status).toBe(409);
    });

    test('should set Content-Type header', () => {
      const res = error('err');
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('parseBody()', () => {
    test('should parse valid JSON body', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ name: 'test', value: 42 }),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await parseBody<{ name: string; value: number }>(req);
      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    test('should throw on invalid JSON', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: 'not valid json{{{',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(parseBody(req)).rejects.toThrow('Invalid JSON body');
    });

    test('should throw on empty body', async () => {
      const req = new Request('http://localhost', { method: 'POST' });
      expect(parseBody(req)).rejects.toThrow();
    });

    test('should parse nested JSON objects', async () => {
      const data = { nested: { deep: { value: true } } };
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await parseBody<typeof data>(req);
      expect(result.nested.deep.value).toBe(true);
    });
  });
});
