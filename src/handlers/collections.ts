import { Hono } from 'hono';
import type { Env } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { buildCollectionResponse } from '../services/collectionService';

const collections = new Hono<{ Bindings: Env }>();

collections.get('/', async (c) => {
  try {
    const filters = {
      category: c.req.query('category'),
      difficulty: c.req.query('difficulty'),
      search: c.req.query('search'),
      requiresGpu: c.req.query('requires_gpu'),
      collectionType: c.req.query('collection_type')
    };

    const response = await buildCollectionResponse(c.env.DB, filters);
    return successResponse(c, response);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch data', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default collections;