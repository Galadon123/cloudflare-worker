import { Hono } from 'hono';
import type { Env } from '../types';
import { errorResponse, successResponse } from '../utils/responses';

const search = new Hono<{ Bindings: Env }>();

// GET /api/search
search.get('/', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const type = c.req.query('type');
    const difficulty = c.req.query('difficulty');
    const status = c.req.query('status') || 'live';
    const roadmapId = c.req.query('roadmapId');
    const hasPytorch = c.req.query('has_pytorch');
    const hasTinygrad = c.req.query('has_tinygrad');
    const requiresGpu = c.req.query('requires_gpu');

    const db = c.env.DB;
    const results: any[] = [];

    // Search in different tables based on type
    const types = type ? [type] : ['roadmap', 'module', 'chapter', 'lesson', 'lab', 'problem'];

    for (const searchType of types) {
      let sql = '';
      let params: any[] = [];

      switch (searchType) {
        case 'roadmap':
          sql = `SELECT 'roadmap' as type, roadmap_id as id, name, title, description, NULL as difficulty, status FROM roadmaps WHERE status = ?`;
          params = [status];
          if (query) {
            sql += ` AND (name LIKE ? OR title LIKE ? OR description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
          }
          break;

        case 'module':
          sql = `SELECT 'module' as type, module_id as id, name, NULL as title, description, difficulty, status FROM modules WHERE status = ?`;
          params = [status];
          if (roadmapId) {
            sql += ` AND roadmap_id = ?`;
            params.push(roadmapId);
          }
          if (query) {
            sql += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`);
          }
          if (difficulty) {
            sql += ` AND difficulty = ?`;
            params.push(difficulty);
          }
          break;

        case 'chapter':
          sql = `SELECT 'chapter' as type, chapter_id as id, name, NULL as title, description, difficulty, status FROM roadmap_chapters WHERE status = ?`;
          params = [status];
          if (roadmapId) {
            sql += ` AND roadmap_id = ?`;
            params.push(roadmapId);
          }
          if (query) {
            sql += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`);
          }
          if (difficulty) {
            sql += ` AND difficulty = ?`;
            params.push(difficulty);
          }
          break;

        case 'lesson':
          sql = `SELECT 'lesson' as type, lesson_id as id, name, NULL as title, description, difficulty, status FROM lessons WHERE status = ?`;
          params = [status];
          if (roadmapId) {
            sql += ` AND roadmap_id = ?`;
            params.push(roadmapId);
          }
          if (query) {
            sql += ` AND (name LIKE ? OR description LIKE ? OR content LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
          }
          if (difficulty) {
            sql += ` AND difficulty = ?`;
            params.push(difficulty);
          }
          break;

        case 'lab':
          sql = `SELECT 'lab' as type, lab_id as id, name, title, description, difficulty, status, has_pytorch, has_tinygrad, requires_gpu FROM roadmap_labs WHERE status = ?`;
          params = [status];
          if (roadmapId) {
            sql += ` AND roadmap_id = ?`;
            params.push(roadmapId);
          }
          if (query) {
            sql += ` AND (name LIKE ? OR title LIKE ? OR description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
          }
          if (difficulty) {
            sql += ` AND difficulty = ?`;
            params.push(difficulty);
          }
          if (hasPytorch !== undefined) {
            sql += ` AND has_pytorch = ?`;
            params.push(hasPytorch === 'true' ? 1 : 0);
          }
          if (hasTinygrad !== undefined) {
            sql += ` AND has_tinygrad = ?`;
            params.push(hasTinygrad === 'true' ? 1 : 0);
          }
          if (requiresGpu !== undefined) {
            sql += ` AND requires_gpu = ?`;
            params.push(requiresGpu === 'true' ? 1 : 0);
          }
          break;

        case 'problem':
          sql = `SELECT 'problem' as type, problem_id as id, name, title, description, difficulty, status, has_pytorch, has_tinygrad, requires_gpu FROM roadmap_problems WHERE status = ?`;
          params = [status];
          if (roadmapId) {
            sql += ` AND roadmap_id = ?`;
            params.push(roadmapId);
          }
          if (query) {
            sql += ` AND (name LIKE ? OR title LIKE ? OR description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
          }
          if (difficulty) {
            sql += ` AND difficulty = ?`;
            params.push(difficulty);
          }
          if (hasPytorch !== undefined) {
            sql += ` AND has_pytorch = ?`;
            params.push(hasPytorch === 'true' ? 1 : 0);
          }
          if (hasTinygrad !== undefined) {
            sql += ` AND has_tinygrad = ?`;
            params.push(hasTinygrad === 'true' ? 1 : 0);
          }
          if (requiresGpu !== undefined) {
            sql += ` AND requires_gpu = ?`;
            params.push(requiresGpu === 'true' ? 1 : 0);
          }
          break;
      }

      if (sql) {
        const { results: typeResults } = await db.prepare(sql).bind(...params).all();
        results.push(...typeResults);
      }
    }

    return successResponse(c, {
      success: true,
      data: results,
      count: results.length,
      query: {
        q: query,
        type,
        difficulty,
        status,
        roadmapId,
        has_pytorch: hasPytorch,
        has_tinygrad: hasTinygrad,
        requires_gpu: requiresGpu
      }
    });
  } catch (error) {
    return errorResponse(c, 'Search failed', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default search;