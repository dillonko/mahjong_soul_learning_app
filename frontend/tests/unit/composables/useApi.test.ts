import { describe, it, expect, beforeEach, vi } from 'vitest';

// $fetch is already stubbed globally in setup.ts
const mockFetch = (globalThis as any).$fetch;

import { useApi } from '~/composables/useApi';

describe('useApi Composable', () => {
  let api: ReturnType<typeof useApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api = useApi();
  });

  describe('get()', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValue({ success: true, data: [1, 2, 3] });

      const result = await api.get('/api/modules');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/modules',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual([1, 2, 3]);
    });

    it('should include auth header when token exists', async () => {
      localStorage.setItem('auth_token', 'my-jwt-token');
      // Recreate api to pick up the new token
      api = useApi();
      mockFetch.mockResolvedValue({ success: true, data: [] });

      await api.get('/api/progress');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-jwt-token',
          }),
        })
      );
    });

    it('should not include auth header when no token', async () => {
      mockFetch.mockResolvedValue({ success: true, data: [] });

      await api.get('/api/modules');

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });
  });

  describe('post()', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({ success: true, data: { id: 1 } });

      const result = await api.post('/api/auth/register', { email: 'test@test.com', password: 'pass' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: { email: 'test@test.com', password: 'pass' },
        })
      );
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('put()', () => {
    it('should make PUT request', async () => {
      mockFetch.mockResolvedValue({ success: true, data: { updated: true } });

      await api.put('/api/modules/1', { title: 'Updated' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/modules/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('del()', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValue({ success: true, data: { deleted: true } });

      await api.del('/api/progress');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/progress',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('should throw when API returns success: false', async () => {
      mockFetch.mockResolvedValue({ success: false, error: 'Bad request' });

      await expect(api.get('/api/test')).rejects.toThrow('Bad request');
    });

    it('should throw generic error when no error message', async () => {
      mockFetch.mockResolvedValue({ success: false });

      await expect(api.get('/api/test')).rejects.toThrow('Request failed');
    });
  });

  describe('getToken()', () => {
    it('should return null when no token stored', () => {
      expect(api.getToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token');
      expect(api.getToken()).toBe('stored-token');
    });
  });
});
