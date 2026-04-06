import { verifyToken } from '../utils/auth';
import { error } from '../utils/response';

export interface AuthContext {
  userId?: number;
  guestId?: number;
  isGuest: boolean;
}

/**
 * Extract auth context from request. Returns null if no valid token.
 * Does NOT reject — allows routes to decide if auth is required.
 */
export function getAuthContext(req: Request): AuthContext | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.slice(7);
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware that requires authentication. Returns error response if not authed.
 */
export function requireAuth(req: Request): AuthContext | Response {
  const ctx = getAuthContext(req);
  if (!ctx) return error('Authentication required', 401);
  return ctx;
}
