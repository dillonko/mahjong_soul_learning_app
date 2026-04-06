import prisma from '../db';
import { success, error, parseBody } from '../utils/response';
import { requireAuth, type AuthContext } from '../middleware/auth';

export async function handleProgress(req: Request, path: string): Promise<Response> {
  const authResult = requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const ctx = authResult as AuthContext;

  // GET /api/progress — get all progress for current user/guest
  if (path === '/api/progress' && req.method === 'GET') {
    try {
      const where = ctx.isGuest ? { guestId: ctx.guestId } : { userId: ctx.userId };
      const progress = await prisma.progress.findMany({
        where,
        include: { module: true },
        orderBy: { module: { order: 'asc' } },
      });
      return success(progress);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // POST /api/progress — save/update progress for a module
  if (path === '/api/progress' && req.method === 'POST') {
    try {
      const { moduleId, completed, score } = await parseBody<{ moduleId: number; completed?: boolean; score?: number }>(req);
      if (!moduleId) return error('moduleId is required');

      // Check module exists
      const mod = await prisma.module.findUnique({ where: { id: moduleId } });
      if (!mod) return error('Module not found', 404);

      const data: any = {
        moduleId,
        completed: completed ?? false,
        score: score ?? 0,
        lastAccessed: new Date(),
      };

      if (ctx.isGuest) {
        data.guestId = ctx.guestId;
        // Find existing
        const existing = await prisma.progress.findFirst({ where: { guestId: ctx.guestId, moduleId } });
        if (existing) {
          const updated = await prisma.progress.update({ where: { id: existing.id }, data });
          return success(updated);
        }
      } else {
        data.userId = ctx.userId;
        const existing = await prisma.progress.findFirst({ where: { userId: ctx.userId, moduleId } });
        if (existing) {
          const updated = await prisma.progress.update({ where: { id: existing.id }, data });
          return success(updated);
        }
      }

      const progress = await prisma.progress.create({ data });
      return success(progress, 201);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // DELETE /api/progress — reset all progress (restart)
  if (path === '/api/progress' && req.method === 'DELETE') {
    try {
      const where = ctx.isGuest ? { guestId: ctx.guestId } : { userId: ctx.userId };
      await prisma.progress.deleteMany({ where });
      return success({ reset: true });
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  return error('Not found', 404);
}
