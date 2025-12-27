import { Hono } from 'hono';
import type { Env, Lab } from '../types';
import { createCrudHandlers } from '../utils/crud';

const labs = new Hono<{ Bindings: Env }>();

const labOperations = {
  create: async (db: D1Database, data: Lab): Promise<any> => {
    const result = await db
      .prepare(`INSERT INTO labs (title, difficulty, has_tinygraded, has_pytorch, 
        requires_gpu, problem_type, collection_type, repository, chapter_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        data.title, data.difficulty, data.has_tinygraded, data.has_pytorch,
        data.requires_gpu, data.problem_type, data.collection_type,
        data.repository, data.chapter_id
      )
      .run();
    
    return await db
      .prepare('SELECT * FROM labs WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();
  },

  getAll: async (db: D1Database, filters?: Record<string, any>): Promise<any[]> => {
    let query = 'SELECT * FROM labs WHERE 1=1';
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
      .prepare('SELECT * FROM labs WHERE id = ?')
      .bind(id)
      .first();
  },

  update: async (db: D1Database, id: string, data: Lab): Promise<any> => {
    await db
      .prepare(`UPDATE labs SET title = ?, difficulty = ?, has_tinygraded = ?, 
        has_pytorch = ?, requires_gpu = ?, problem_type = ?, collection_type = ?, 
        repository = ?, chapter_id = ? WHERE id = ?`)
      .bind(
        data.title, data.difficulty, data.has_tinygraded, data.has_pytorch,
        data.requires_gpu, data.problem_type, data.collection_type,
        data.repository, data.chapter_id, id
      )
      .run();
    
    return await db
      .prepare('SELECT * FROM labs WHERE id = ?')
      .bind(id)
      .first();
  },

  delete: async (db: D1Database, id: string): Promise<boolean> => {
    await db
      .prepare('DELETE FROM labs WHERE id = ?')
      .bind(id)
      .run();
    return true;
  }
};

const handlers = createCrudHandlers(labOperations);

labs.post('/', handlers.create);
labs.get('/', handlers.getAll);
labs.get('/:id', handlers.getById);
labs.put('/:id', handlers.update);
labs.delete('/:id', handlers.delete);

export default labs;