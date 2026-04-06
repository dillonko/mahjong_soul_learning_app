/**
 * Test helper utilities for making HTTP requests to the running test server.
 */
import { generateToken } from '../src/utils/auth';
import { getBaseUrl } from './test-server';

export function url(path: string): string {
  return `${getBaseUrl()}${path}`;
}

export function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function jsonHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}

export function makeUserToken(userId: number): string {
  return generateToken({ userId, isGuest: false });
}

export function makeGuestToken(guestId: number): string {
  return generateToken({ guestId, isGuest: true });
}

export async function registerUser(email: string, password: string, username: string) {
  const res = await fetch(url('/api/auth/register'), {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password, username }),
  });
  return { res, body: await res.json() };
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(url('/api/auth/login'), {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return { res, body: await res.json() };
}

export async function createGuest() {
  const res = await fetch(url('/api/auth/guest'), { method: 'POST' });
  return { res, body: await res.json() };
}
