import { handleCors, withCors } from './middleware/cors';
import { handleAuth } from './routes/auth';
import { handleModules } from './routes/modules';
import { handleProgress } from './routes/progress';
import { handleKeywords } from './routes/keywords';
import { handleStrategies } from './routes/strategies';
import { error } from './utils/response';
import prisma from './db';

const PORT = parseInt(process.env.PORT || '3001');

// Cleanup expired guest sessions periodically (every hour)
setInterval(async () => {
  try {
    const deleted = await prisma.guestSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (deleted.count > 0) {
      console.log(`[Cleanup] Removed ${deleted.count} expired guest sessions`);
    }
  } catch (e) {
    console.error('[Cleanup] Error:', e);
  }
}, 60 * 60 * 1000);

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const url = new URL(req.url);
    const path = url.pathname;

    let response: Response;

    try {
      // Route to appropriate handler
      if (path.startsWith('/api/auth')) {
        response = await handleAuth(req, path);
      } else if (path.startsWith('/api/modules')) {
        response = await handleModules(req, path);
      } else if (path.startsWith('/api/progress')) {
        response = await handleProgress(req, path);
      } else if (path.startsWith('/api/keywords')) {
        response = await handleKeywords(req, path);
      } else if (path.startsWith('/api/strategies')) {
        response = await handleStrategies(req, path);
      } else if (path === '/api/health') {
        response = new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        response = error('Not found', 404);
      }
    } catch (e: any) {
      console.error('Unhandled error:', e);
      response = error('Internal server error', 500);
    }

    return withCors(response);
  },
});

console.log(`\n🀄 Mahjong Soul Learning API running on http://localhost:${server.port}`);
console.log(`   Health check: http://localhost:${server.port}/api/health\n`);
