import { describe, test, expect } from 'bun:test';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateSessionToken,
  getGuestExpiryDate,
} from '../../src/utils/auth';

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    test('should return a hashed string different from input', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should produce different hashes for same password (salt)', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });

    test('should produce bcrypt-formatted hash', async () => {
      const hash = await hashPassword('test');
      expect(hash).toMatch(/^\$2[aby]?\$/);
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const password = 'testPassword';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    test('should return false for wrong password', async () => {
      const hash = await hashPassword('correctPassword');
      const result = await comparePassword('wrongPassword', hash);
      expect(result).toBe(false);
    });

    test('should return false for empty password', async () => {
      const hash = await hashPassword('realPassword');
      const result = await comparePassword('', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate a JWT token string for user', () => {
      const token = generateToken({ userId: 1, isGuest: false });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate a JWT token string for guest', () => {
      const token = generateToken({ guestId: 5, isGuest: true });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should encode payload in token', () => {
      const token = generateToken({ userId: 42, isGuest: false });
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(42);
      expect(decoded.isGuest).toBe(false);
    });
  });

  describe('verifyToken', () => {
    test('should decode a valid token', () => {
      const token = generateToken({ userId: 10, isGuest: false });
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(10);
      expect(decoded.isGuest).toBe(false);
    });

    test('should decode guest token', () => {
      const token = generateToken({ guestId: 7, isGuest: true });
      const decoded = verifyToken(token);
      expect(decoded.guestId).toBe(7);
      expect(decoded.isGuest).toBe(true);
    });

    test('should throw for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    test('should throw for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });

    test('should throw for tampered token', () => {
      const token = generateToken({ userId: 1, isGuest: false });
      const tampered = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });

  describe('generateSessionToken', () => {
    test('should return a UUID string', () => {
      const token = generateSessionToken();
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should return unique tokens', () => {
      const tokens = new Set(Array.from({ length: 100 }, () => generateSessionToken()));
      expect(tokens.size).toBe(100);
    });
  });

  describe('getGuestExpiryDate', () => {
    test('should return a date ~72 hours in the future', () => {
      const before = Date.now();
      const expiry = getGuestExpiryDate();
      const after = Date.now();
      const expected72h = 72 * 60 * 60 * 1000;
      expect(expiry.getTime()).toBeGreaterThanOrEqual(before + expected72h - 100);
      expect(expiry.getTime()).toBeLessThanOrEqual(after + expected72h + 100);
    });

    test('should return a Date object', () => {
      const expiry = getGuestExpiryDate();
      expect(expiry).toBeInstanceOf(Date);
    });
  });
});
