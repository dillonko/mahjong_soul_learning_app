import { describe, test, expect } from 'bun:test';
import { corsHeaders, handleCors, withCors } from '../../src/middleware/cors';

describe('CORS Middleware', () => {
  describe('corsHeaders()', () => {
    test('should return required CORS headers', () => {
      const headers = corsHeaders();
      expect(headers['Access-Control-Allow-Origin']).toBeDefined();
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Methods']).toContain('PUT');
      expect(headers['Access-Control-Allow-Methods']).toContain('DELETE');
      expect(headers['Access-Control-Allow-Headers']).toContain('Authorization');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });

  describe('handleCors()', () => {
    test('should return 204 response for OPTIONS request', () => {
      const req = new Request('http://localhost:3001/api/test', { method: 'OPTIONS' });
      const res = handleCors(req);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(204);
    });

    test('should include CORS headers in OPTIONS response', () => {
      const req = new Request('http://localhost:3001/api/test', { method: 'OPTIONS' });
      const res = handleCors(req)!;
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(res.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });

    test('should return null for non-OPTIONS requests', () => {
      const getReq = new Request('http://localhost:3001/api/test', { method: 'GET' });
      expect(handleCors(getReq)).toBeNull();

      const postReq = new Request('http://localhost:3001/api/test', { method: 'POST' });
      expect(handleCors(postReq)).toBeNull();
    });
  });

  describe('withCors()', () => {
    test('should add CORS headers to response', () => {
      const original = new Response('test', { status: 200 });
      const corsified = withCors(original);
      expect(corsified.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(corsified.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });

    test('should preserve original status code', () => {
      const original = new Response('not found', { status: 404 });
      const corsified = withCors(original);
      expect(corsified.status).toBe(404);
    });

    test('should preserve original body', async () => {
      const original = new Response(JSON.stringify({ test: true }), { status: 200 });
      const corsified = withCors(original);
      const body = await corsified.json();
      expect(body.test).toBe(true);
    });
  });
});
