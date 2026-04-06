import prisma from '../db';
import { success, error, parseBody } from '../utils/response';

export async function handleStrategies(req: Request, path: string): Promise<Response> {
  const url = new URL(req.url);

  // GET /api/strategies — list all, optional ?difficulty= filter
  if (path === '/api/strategies' && req.method === 'GET') {
    try {
      const difficulty = url.searchParams.get('difficulty');
      const where = difficulty ? { difficulty } : {};
      const strategies = await prisma.strategy.findMany({ where, orderBy: { createdAt: 'asc' } });
      return success(strategies);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // GET /api/strategies/:id
  const singleMatch = path.match(/^\/api\/strategies\/(\d+)$/);
  if (singleMatch && req.method === 'GET') {
    try {
      const id = parseInt(singleMatch[1]);
      const strat = await prisma.strategy.findUnique({ where: { id } });
      if (!strat) return error('Strategy not found', 404);
      return success(strat);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // POST /api/strategies
  if (path === '/api/strategies' && req.method === 'POST') {
    try {
      const body = await parseBody<{ title: string; description: string; difficulty?: string; content: string }>(req);
      const strat = await prisma.strategy.create({ data: { ...body, difficulty: body.difficulty || 'beginner' } });
      return success(strat, 201);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  return error('Not found', 404);
}
