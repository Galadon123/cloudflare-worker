import { Hono } from 'hono';
import type { Env, Problem } from '../types';
import { createCrudHandlers } from '../utils/crud';

const problems = new Hono<{ Bindings: Env }>();

const problemOperations = {
  create: async (db: D1Database, data: Problem): Promise<any> => {
    const result = await db
      .prepare(`INSERT INTO problems (title, difficulty, has_tinygraded, has_pytorch, 
        requires_gpu, problem_type, collection_type, repository, chapter_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        data.title, data.difficulty, data.has_tinygraded, data.has_pytorch,
        data.requires_gpu, data.problem_type, data.collection_type,
        data.repository, data.chapter_id
      )
      .run();
    
    return await db
      .prepare('SELECT * FROM problems WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();
  },

  getAll: async (db: D1Database, filters?: Record<string, any>): Promise<any[]> => {
    let query = 'SELECT * FROM problems WHERE 1=1';
    const params: (string | number | boolean)[] = [];
    
    if (filters?.chapter_id) {
      query += ' AND chapter_id = ?';
      params.push(Number(filters.chapter_id));
    }
    if (filters?.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }
    if (filters?.problem_type) {
      query += ' AND problem_type = ?';
      params.push(filters.problem_type);
    }
    if (filters?.requires_gpu !== undefined) {
      query += ' AND requires_gpu = ?';
      params.push(filters.requires_gpu === 'true');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all() 
      : await stmt.all();
    
    return results;
  },

  getById: async (db: D1Database, id: string): Promise<any> => {
    return await db
      .prepare('SELECT * FROM problems WHERE id = ?')
      .bind(id)
      .first();
  },

  update: async (db: D1Database, id: string, data: Problem): Promise<any> => {
    await db
      .prepare(`UPDATE problems SET title = ?, difficulty = ?, has_tinygraded = ?, 
        has_pytorch = ?, requires_gpu = ?, problem_type = ?, collection_type = ?, 
        repository = ?, chapter_id = ? WHERE id = ?`)
      .bind(
        data.title, data.difficulty, data.has_tinygraded, data.has_pytorch,
        data.requires_gpu, data.problem_type, data.collection_type,
        data.repository, data.chapter_id, id
      )
      .run();
    
    return await db
      .prepare('SELECT * FROM problems WHERE id = ?')
      .bind(id)
      .first();
  },

  delete: async (db: D1Database, id: string): Promise<boolean> => {
    await db
      .prepare('DELETE FROM problems WHERE id = ?')
      .bind(id)
      .run();
    return true;
  }
};

const handlers = createCrudHandlers(problemOperations);

problems.post('/', handlers.create);
problems.get('/', handlers.getAll);
problems.get('/:id', handlers.getById);
problems.put('/:id', handlers.update);
problems.delete('/:id', handlers.delete);

export default problems;