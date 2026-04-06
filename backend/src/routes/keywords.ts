import prisma from '../db';
import { success, error, parseBody } from '../utils/response';

export async function handleKeywords(req: Request, path: string): Promise<Response> {
  const url = new URL(req.url);

  // GET /api/keywords — list all, optional ?category= filter
  if (path === '/api/keywords' && req.method === 'GET') {
    try {
      const category = url.searchParams.get('category');
      const where = category ? { category } : {};
      const keywords = await prisma.keyword.findMany({ where, orderBy: { term: 'asc' } });
      return success(keywords);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // GET /api/keywords/:id
  const singleMatch = path.match(/^\/api\/keywords\/(\d+)$/);
  if (singleMatch && req.method === 'GET') {
    try {
      const id = parseInt(singleMatch[1]);
      const kw = await prisma.keyword.findUnique({ where: { id } });
      if (!kw) return error('Keyword not found', 404);
      return success(kw);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // POST /api/keywords
  if (path === '/api/keywords' && req.method === 'POST') {
    try {
      const body = await parseBody<{ term: string; definition: string; category: string; examples?: string }>(req);
      const kw = await prisma.keyword.create({ data: { ...body, examples: body.examples || '' } });
      return success(kw, 201);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  // GET /api/keywords/random?count=5 — for flashcard mode
  if (path === '/api/keywords/random' && req.method === 'GET') {
    try {
      const count = parseInt(url.searchParams.get('count') || '5');
      // SQLite doesn't have RANDOM() in Prisma, so fetch all and shuffle
      const all = await prisma.keyword.findMany();
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, count);
      return success(shuffled);
    } catch (e: any) {
      return error(e.message, 500);
    }
  }

  return error('Not found', 404);
}
