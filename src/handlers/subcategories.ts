import { Hono } from 'hono';
import type { Env, SubCategory, SubCategoryResponse } from '../types';
import { createCrudHandlers } from '../utils/crud';

const subcategories = new Hono<{ Bindings: Env }>();

const subcategoryOperations = {
  create: async (db: D1Database, data: SubCategory): Promise<SubCategoryResponse> => {
    const result = await db
      .prepare('INSERT INTO subcategories (name, slug, category_id) VALUES (?, ?, ?)')
      .bind(data.name, data.slug, data.category_id)
      .run();
    
    return await db
      .prepare('SELECT * FROM subcategories WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<SubCategoryResponse>() as SubCategoryResponse;
  },

  getAll: async (db: D1Database, filters?: Record<string, any>): Promise<SubCategoryResponse[]> => {
    let query = 'SELECT * FROM subcategories';
    const params: number[] = [];
    
    if (filters?.category_id) {
      query += ' WHERE category_id = ?';
      params.push(Number(filters.category_id));
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all<SubCategoryResponse>() 
      : await stmt.all<SubCategoryResponse>();
    
    return results;
  },

  getById: async (db: D1Database, id: string): Promise<SubCategoryResponse | null> => {
    return await db
      .prepare('SELECT * FROM subcategories WHERE id = ?')
      .bind(id)
      .first<SubCategoryResponse>();
  },

  update: async (db: D1Database, id: string, data: SubCategory): Promise<SubCategoryResponse | null> => {
    await db
      .prepare('UPDATE subcategories SET name = ?, slug = ?, category_id = ? WHERE id = ?')
      .bind(data.name, data.slug, data.category_id, id)
      .run();
    
    return await db
      .prepare('SELECT * FROM subcategories WHERE id = ?')
      .bind(id)
      .first<SubCategoryResponse>();
  },

  delete: async (db: D1Database, id: string): Promise<boolean> => {
    await db
      .prepare('DELETE FROM subcategories WHERE id = ?')
      .bind(id)
      .run();
    return true;
  }
};

const handlers = createCrudHandlers(subcategoryOperations);

subcategories.post('/', handlers.create);
subcategories.get('/', handlers.getAll);
subcategories.get('/:id', handlers.getById);
subcategories.put('/:id', handlers.update);
subcategories.delete('/:id', handlers.delete);

export default subcategories;