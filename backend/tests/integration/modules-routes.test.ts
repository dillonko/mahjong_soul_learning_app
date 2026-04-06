import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { startTestServer, stopTestServer, seedTestData } from '../test-server';
import { url, jsonHeaders } from '../helpers';

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  await seedTestData();
});

describe('Modules API Endpoints', () => {
  describe('GET /api/modules', () => {
    test('should return all modules ordered by order field', async () => {
      const res = await fetch(url('/api/modules'));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(2);
      expect(body.data[0].order).toBe(1);
      expect(body.data[1].order).toBe(2);
    });

    test('should return module properties', async () => {
      const res = await fetch(url('/api/modules'));
      const body = await res.json();
      const mod = body.data[0];
      expect(mod.title).toBeDefined();
      expect(mod.description).toBeDefined();
      expect(mod.order).toBeDefined();
      expect(mod.content).toBeDefined();
      expect(mod.type).toBe('lesson');
    });
  });

  describe('GET /api/modules/:id', () => {
    test('should return a single module by id', async () => {
      const allRes = await fetch(url('/api/modules'));
      const allBody = await allRes.json();
      const moduleId = allBody.data[0].id;

      const res = await fetch(url(`/api/modules/${moduleId}`));
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.id).toBe(moduleId);
      expect(body.data.title).toContain('Basics');
    });

    test('should return 404 for non-existent module', async () => {
      const res = await fetch(url('/api/modules/99999'));
      const body = await res.json();
      expect(res.status).toBe(404);
      expect(body.error).toContain('not found');
    });

    test('should have parseable JSON content', async () => {
      const allRes = await fetch(url('/api/modules'));
      const allBody = await allRes.json();
      const moduleId = allBody.data[0].id;

      const res = await fetch(url(`/api/modules/${moduleId}`));
      const body = await res.json();
      const content = JSON.parse(body.data.content);
      expect(content.sections).toBeArray();
      expect(content.quiz).toBeArray();
    });
  });

  describe('POST /api/modules', () => {
    test('should create a new module', async () => {
      const res = await fetch(url('/api/modules'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          title: 'New Module',
          description: 'A new test module',
          order: 99,
          content: JSON.stringify({ sections: [], quiz: [] }),
        }),
      });
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.data.title).toBe('New Module');
      expect(body.data.type).toBe('lesson');
    });

    test('should accept custom type', async () => {
      const res = await fetch(url('/api/modules'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          title: 'Quiz Module',
          description: 'A quiz',
          order: 100,
          content: '{}',
          type: 'quiz',
        }),
      });
      const body = await res.json();
      expect(body.data.type).toBe('quiz');
    });
  });

  describe('PUT /api/modules/:id', () => {
    test('should update an existing module', async () => {
      const allRes = await fetch(url('/api/modules'));
      const allBody = await allRes.json();
      const moduleId = allBody.data[0].id;

      const res = await fetch(url(`/api/modules/${moduleId}`), {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify({ title: 'Updated Title' }),
      });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/modules/:id', () => {
    test('should delete a module', async () => {
      const allRes = await fetch(url('/api/modules'));
      const allBody = await allRes.json();
      const moduleId = allBody.data[0].id;

      const res = await fetch(url(`/api/modules/${moduleId}`), { method: 'DELETE' });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.deleted).toBe(true);

      const checkRes = await fetch(url(`/api/modules/${moduleId}`));
      expect(checkRes.status).toBe(404);
    });
  });
});
