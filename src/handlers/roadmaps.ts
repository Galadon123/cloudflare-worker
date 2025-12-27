import { Hono } from 'hono';
import type { Env, Roadmap, RoadmapResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import * as roadmapService from '../services/roadmapService';

const roadmaps = new Hono<{ Bindings: Env }>();

// GET /api/roadmaps - Get all roadmaps
roadmaps.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const results = await roadmapService.getAllRoadmapsWithCounts(db);
    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch roadmaps', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET /api/roadmap/{roadmapId} - Get detailed roadmap info
roadmaps.get('/:roadmapId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const roadmap = await roadmapService.getRoadmapWithCounts(db, roadmapId);

    if (!roadmap) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    return successResponse(c, roadmap);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET /api/roadmap/{roadmapId}/complete - Get complete roadmap with all nested data
roadmaps.get('/:roadmapId/complete', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const roadmap = await roadmapService.getRoadmapComplete(db, roadmapId);

    if (!roadmap) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    return successResponse(c, roadmap);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch complete roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/create - Create roadmap
roadmaps.post('/admin/roadmap/create', async (c) => {
  try {
    const body = await c.req.json<Roadmap>();
    const db = c.env.DB;

    const created = await roadmapService.createRoadmap(db, body);
    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create roadmap', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT /api/admin/roadmap/{roadmapId} - Update roadmap
roadmaps.put('/admin/:roadmapId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const body = await c.req.json<Partial<Roadmap>>();
    const db = c.env.DB;

    const exists = await roadmapService.roadmapExists(db, roadmapId);
    if (!exists) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    const updated = await roadmapService.updateRoadmap(db, roadmapId, body);
    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE /api/admin/roadmap/{roadmapId} - Delete roadmap
roadmaps.delete('/admin/:roadmapId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const exists = await roadmapService.roadmapExists(db, roadmapId);
    if (!exists) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    await roadmapService.deleteRoadmap(db, roadmapId);
    return successResponse(c, { message: 'Roadmap deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/{roadmapId}/publish - Publish roadmap
roadmaps.post('/admin/:roadmapId/publish', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const updated = await roadmapService.updateRoadmapStatus(db, roadmapId, 'active');
    if (!updated) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to publish roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/{roadmapId}/archive - Archive roadmap
roadmaps.post('/admin/:roadmapId/archive', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const updated = await roadmapService.updateRoadmapStatus(db, roadmapId, 'archived');
    if (!updated) {
      return errorResponse(c, 'Roadmap not found', 'No roadmap found with this ID', 404);
    }

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to archive roadmap', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default roadmaps;