import prisma from '../db';
import { success, error, parseBody } from '../utils/response';
import { hashPassword, comparePassword, generateToken, generateSessionToken, getGuestExpiryDate } from '../utils/auth';
import { getAuthContext } from '../middleware/auth';

interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function handleAuth(req: Request, path: string): Promise<Response> {
  // POST /api/auth/register
  if (path === '/api/auth/register' && req.method === 'POST') {
    try {
      const { email, password, username } = await parseBody<RegisterBody>(req);

      if (!email || !password || !username) {
        return error('Email, password, and username are required');
      }
      if (password.length < 6) {
        return error('Password must be at least 6 characters');
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error('Email already registered', 409);

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { email, password: hashed, username },
      });

      const token = generateToken({ userId: user.id, isGuest: false });
      return success({
        token,
        user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt.toISOString() },
        isGuest: false,
      }, 201);
    } catch (e: any) {
      return error(e.message || 'Registration failed', 500);
    }
  }

  // POST /api/auth/login
  if (path === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password } = await parseBody<LoginBody>(req);

      if (!email || !password) return error('Email and password are required');

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return error('Invalid credentials', 401);

      const valid = await comparePassword(password, user.password);
      if (!valid) return error('Invalid credentials', 401);

      const token = generateToken({ userId: user.id, isGuest: false });
      return success({
        token,
        user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt.toISOString() },
        isGuest: false,
      });
    } catch (e: any) {
      return error(e.message || 'Login failed', 500);
    }
  }

  // POST /api/auth/guest
  if (path === '/api/auth/guest' && req.method === 'POST') {
    try {
      const session = await prisma.guestSession.create({
        data: {
          sessionToken: generateSessionToken(),
          expiresAt: getGuestExpiryDate(),
        },
      });

      const token = generateToken({ guestId: session.id, isGuest: true });
      return success({
        token,
        guest: {
          id: session.id,
          sessionToken: session.sessionToken,
          createdAt: session.createdAt.toISOString(),
          expiresAt: session.expiresAt.toISOString(),
        },
        isGuest: true,
      }, 201);
    } catch (e: any) {
      return error(e.message || 'Guest session creation failed', 500);
    }
  }

  // GET /api/auth/me
  if (path === '/api/auth/me' && req.method === 'GET') {
    const ctx = getAuthContext(req);
    if (!ctx) return error('Not authenticated', 401);

    try {
      if (ctx.isGuest && ctx.guestId) {
        const guest = await prisma.guestSession.findUnique({ where: { id: ctx.guestId } });
        if (!guest || guest.expiresAt < new Date()) return error('Session expired', 401);
        return success({ isGuest: true, guest: { id: guest.id, sessionToken: guest.sessionToken, createdAt: guest.createdAt.toISOString(), expiresAt: guest.expiresAt.toISOString() } });
      }

      if (ctx.userId) {
        const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
        if (!user) return error('User not found', 404);
        return success({ isGuest: false, user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt.toISOString() } });
      }

      return error('Invalid token', 401);
    } catch (e: any) {
      return error(e.message || 'Failed to fetch user', 500);
    }
  }

  return error('Not found', 404);
}
