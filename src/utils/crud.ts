import type { Context } from 'hono';
import { errorResponse, successResponse } from './responses';

interface CrudOperations<T, TResponse> {
  create: (db: D1Database, data: T) => Promise<TResponse>;
  getAll: (db: D1Database, filters?: Record<string, any>) => Promise<TResponse[]>;
  getById: (db: D1Database, id: string) => Promise<TResponse | null>;
  update: (db: D1Database, id: string, data: T) => Promise<TResponse | null>;
  delete: (db: D1Database, id: string) => Promise<boolean>;
}

export const createCrudHandlers = <T, TResponse>(operations: CrudOperations<T, TResponse>) => ({
  create: async (c: Context) => {
    try {
      const body = await c.req.json<T>();
      const result = await operations.create(c.env.DB, body);
      return successResponse(c, result);
    } catch (error) {
      return errorResponse(c, 'Creation failed', error instanceof Error ? error.message : 'Unknown error', 400);
    }
  },

  getAll: async (c: Context) => {
    try {
      const queries = c.req.queries();
      const filters: Record<string, any> = {};
      for (const [key, values] of Object.entries(queries)) {
        filters[key] = values[0];
      }
      const results = await operations.getAll(c.env.DB, filters);
      return successResponse(c, results);
    } catch (error) {
      return errorResponse(c, 'Fetch failed', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  getById: async (c: Context) => {
    try {
      const id = c.req.param('id');
      const result = await operations.getById(c.env.DB, id);
      
      if (!result) {
        return errorResponse(c, 'Not found', 'Resource not found', 404);
      }
      
      return successResponse(c, result);
    } catch (error) {
      return errorResponse(c, 'Fetch failed', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  update: async (c: Context) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<T>();
      
      const existing = await operations.getById(c.env.DB, id);
      if (!existing) {
        return errorResponse(c, 'Not found', 'Resource not found', 404);
      }
      
      const result = await operations.update(c.env.DB, id, body);
      return successResponse(c, result);
    } catch (error) {
      return errorResponse(c, 'Update failed', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  delete: async (c: Context) => {
    try {
      const id = c.req.param('id');
      
      const existing = await operations.getById(c.env.DB, id);
      if (!existing) {
        return errorResponse(c, 'Not found', 'Resource not found', 404);
      }
      
      await operations.delete(c.env.DB, id);
      return successResponse(c, { message: 'Resource deleted successfully' });
    } catch (error) {
      return errorResponse(c, 'Delete failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }
});