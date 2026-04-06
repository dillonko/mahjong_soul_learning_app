import prisma from '../db';
import { success, error, parseBody } from '../utils/response';

export async function handleModules(req: Request, path: string): Promise<Response> {
  // GET /api/modules — list all modules ordered
  if (path === '/api/modules' && req.method === 'GET') {
    try {
      const modules = await prisma.module.findMany({ orderBy: { order: 'asc' } });
      return success(modules);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // GET /api/modules/:id
  const singleMatch = path.match(/^\/api\/modules\/(\d+)$/);
  if (singleMatch && req.method === 'GET') {
    try {
      const id = parseInt(singleMatch[1]);
      const mod = await prisma.module.findUnique({ where: { id } });
      if (!mod) return error('Module not found', 404);
      return success(mod);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // POST /api/modules (admin-like, for seeding/creation)
  if (path === '/api/modules' && req.method === 'POST') {
    try {
      const body = await parseBody<{ title: string; description: string; order: number; content: string; type?: string }>(req);
      const mod = await prisma.module.create({ data: { ...body, type: body.type || 'lesson' } });
      return success(mod, 201);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // PUT /api/modules/:id
  if (singleMatch && req.method === 'PUT') {
    try {
      const id = parseInt(singleMatch[1]);
      const body = await parseBody<Partial<{ title: string; description: string; order: number; content: string; type: string }>>(req);
      const mod = await prisma.module.update({ where: { id }, data: body });
      return success(mod);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // DELETE /api/modules/:id
  if (singleMatch && req.method === 'DELETE') {
    try {
      const id = parseInt(singleMatch[1]);
      await prisma.module.delete({ where: { id } });
      return success({ deleted: true });
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  return error('Not found', 404);
}
