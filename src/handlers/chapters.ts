import { Hono } from 'hono';
import type { Env, Chapter, ChapterResponse } from '../types';
import { createCrudHandlers } from '../utils/crud';

const chapters = new Hono<{ Bindings: Env }>();

const chapterOperations = {
  create: async (db: D1Database, data: Chapter): Promise<ChapterResponse> => {
    const result = await db
      .prepare('INSERT INTO chapters (name, slug, subcategory_id) VALUES (?, ?, ?)')
      .bind(data.name, data.slug, data.subcategory_id)
      .run();
    
    return await db
      .prepare('SELECT * FROM chapters WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<ChapterResponse>() as ChapterResponse;
  },

  getAll: async (db: D1Database, filters?: Record<string, any>): Promise<ChapterResponse[]> => {
    let query = 'SELECT * FROM chapters';
    const params: number[] = [];
    
    if (filters?.subcategory_id) {
      query += ' WHERE subcategory_id = ?';
      params.push(Number(filters.subcategory_id));
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all<ChapterResponse>() 
      : await stmt.all<ChapterResponse>();
    
    return results;
  },

  getById: async (db: D1Database, id: string): Promise<ChapterResponse | null> => {
    return await db
      .prepare('SELECT * FROM chapters WHERE id = ?')
      .bind(id)
      .first<ChapterResponse>();
  },

  update: async (db: D1Database, id: string, data: Chapter): Promise<ChapterResponse | null> => {
    await db
      .prepare('UPDATE chapters SET name = ?, slug = ?, subcategory_id = ? WHERE id = ?')
      .bind(data.name, data.slug, data.subcategory_id, id)
      .run();
    
    return await db
      .prepare('SELECT * FROM chapters WHERE id = ?')
      .bind(id)
      .first<ChapterResponse>();
  },

  delete: async (db: D1Database, id: string): Promise<boolean> => {
    await db
      .prepare('DELETE FROM chapters WHERE id = ?')
      .bind(id)
      .run();
    return true;
  }
};

const handlers = createCrudHandlers(chapterOperations);

chapters.post('/', handlers.create);
chapters.get('/', handlers.getAll);
chapters.get('/:id', handlers.getById);
chapters.put('/:id', handlers.update);
chapters.delete('/:id', handlers.delete);

export default chapters;