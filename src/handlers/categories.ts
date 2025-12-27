import { Hono } from 'hono';
import type { Env, Category, CategoryResponse } from '../types';
import { createCrudHandlers } from '../utils/crud';

const categories = new Hono<{ Bindings: Env }>();

const categoryOperations = {
  create: async (db: D1Database, data: Category): Promise<CategoryResponse> => {
    const result = await db
      .prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
      .bind(data.name, data.slug)
      .run();
    
    return await db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<CategoryResponse>() as CategoryResponse;
  },

  getAll: async (db: D1Database): Promise<CategoryResponse[]> => {
    const { results } = await db
      .prepare('SELECT * FROM categories ORDER BY created_at DESC')
      .all<CategoryResponse>();
    return results;
  },

  getById: async (db: D1Database, id: string): Promise<CategoryResponse | null> => {
    return await db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first<CategoryResponse>();
  },

  update: async (db: D1Database, id: string, data: Category): Promise<CategoryResponse | null> => {
    await db
      .prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?')
      .bind(data.name, data.slug, id)
      .run();
    
    return await db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first<CategoryResponse>();
  },

  delete: async (db: D1Database, id: string): Promise<boolean> => {
    await db
      .prepare('DELETE FROM categories WHERE id = ?')
      .bind(id)
      .run();
    return true;
  }
};

const handlers = createCrudHandlers(categoryOperations);

categories.post('/', handlers.create);
categories.get('/', handlers.getAll);
categories.get('/:id', handlers.getById);
categories.put('/:id', handlers.update);
categories.delete('/:id', handlers.delete);

export default categories;