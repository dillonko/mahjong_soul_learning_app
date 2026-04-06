import { describe, test, expect } from 'bun:test';
import { getAuthContext, requireAuth } from '../../src/middleware/auth';
import { generateToken } from '../../src/utils/auth';

describe('Auth Middleware', () => {
  describe('getAuthContext()', () => {
    test('should return null when no Authorization header', () => {
      const req = new Request('http://localhost:3001/api/test');
      const ctx = getAuthContext(req);
      expect(ctx).toBeNull();
    });

    test('should return null for non-Bearer token', () => {
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: 'Basic abc123' },
      });
      expect(getAuthContext(req)).toBeNull();
    });

    test('should return null for invalid Bearer token', () => {
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(getAuthContext(req)).toBeNull();
    });

    test('should return auth context for valid user token', () => {
      const token = generateToken({ userId: 42, isGuest: false });
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ctx = getAuthContext(req);
      expect(ctx).not.toBeNull();
      expect(ctx!.userId).toBe(42);
      expect(ctx!.isGuest).toBe(false);
    });

    test('should return auth context for valid guest token', () => {
      const token = generateToken({ guestId: 99, isGuest: true });
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ctx = getAuthContext(req);
      expect(ctx).not.toBeNull();
      expect(ctx!.guestId).toBe(99);
      expect(ctx!.isGuest).toBe(true);
    });

    test('should return null for empty Bearer token', () => {
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: 'Bearer ' },
      });
      expect(getAuthContext(req)).toBeNull();
    });
  });

  describe('requireAuth()', () => {
    test('should return 401 Response when not authenticated', () => {
      const req = new Request('http://localhost:3001/api/test');
      const result = requireAuth(req);
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: 'Bearer bad-token' },
      });
      const result = requireAuth(req);
      expect(result).toBeInstanceOf(Response);
      const body = await (result as Response).json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Authentication required');
    });

    test('should return AuthContext for valid token', () => {
      const token = generateToken({ userId: 1, isGuest: false });
      const req = new Request('http://localhost:3001/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = requireAuth(req);
      expect(result).not.toBeInstanceOf(Response);
      expect((result as any).userId).toBe(1);
    });
  });
});
