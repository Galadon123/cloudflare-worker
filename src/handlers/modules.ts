import { Hono } from 'hono';
import type { Env, Module, ModuleResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { generateSlug } from '../utils/slugs';

const modules = new Hono<{ Bindings: Env }>();

// GET /api/roadmap/{roadmapId}/modules - Get all modules in roadmap
modules.get('/:roadmapId/modules', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const db = c.env.DB;

    const { results } = await db
      .prepare(`
        SELECT 
          m.*,
          COUNT(DISTINCT rc.id) as chapter_count,
          COUNT(DISTINCT l.id) as total_lessons,
          COALESCE(SUM(DISTINCT m.estimated_hours), 0) as estimated_hours
        FROM modules m
        LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
        LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
        WHERE m.roadmap_id = ?
        GROUP BY m.id
        ORDER BY m.order_index, m.created_at
      `)
      .bind(roadmapId)
      .all<ModuleResponse>();

    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch modules', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET /api/roadmap/{roadmapId}/module/{moduleId} - Get module details
modules.get('/:roadmapId/module/:moduleId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const db = c.env.DB;

    const module = await db
      .prepare(`
        SELECT 
          m.*,
          COUNT(DISTINCT rc.id) as chapter_count,
          COUNT(DISTINCT l.id) as total_lessons,
          COALESCE(SUM(DISTINCT m.estimated_hours), 0) as estimated_hours
        FROM modules m
        LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
        LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
        WHERE m.roadmap_id = ? AND m.module_id = ?
        GROUP BY m.id
      `)
      .bind(roadmapId, moduleId)
      .first<ModuleResponse>();

    if (!module) {
      return errorResponse(c, 'Module not found', 'No module found with this ID', 404);
    }

    // Get chapters for this module
    const { results: chapters } = await db
      .prepare(`
        SELECT 
          rc.*,
          COUNT(DISTINCT l.id) as lesson_count,
          COUNT(DISTINCT rl.id) as lab_count,
          COUNT(DISTINCT rp.id) as problem_count
        FROM roadmap_chapters rc
        LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
        LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
        LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
        WHERE rc.roadmap_id = ? AND rc.module_id = ?
        GROUP BY rc.id
        ORDER BY rc.order_index, rc.created_at
      `)
      .bind(roadmapId, moduleId)
      .all();

    const moduleWithChapters = {
      ...module,
      chapters
    };

    return successResponse(c, moduleWithChapters);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch module', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/module/create - Create module (requires roadmap_id in body)
modules.post('/admin/roadmap/module/create', async (c) => {
  try {
    const body = await c.req.json<Module>();
    const db = c.env.DB;

    // Verify roadmap exists
    const roadmap = await db
      .prepare('SELECT * FROM roadmaps WHERE roadmap_id = ?')
      .bind(body.roadmap_id)
      .first();

    if (!roadmap) {
      return errorResponse(c, 'Roadmap not found', 'The specified roadmap does not exist', 404);
    }

    const moduleId = generateSlug(body.name);

    // Get next order index
    const { order_index } = await db
      .prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as order_index FROM modules WHERE roadmap_id = ?')
      .bind(body.roadmap_id)
      .first<{ order_index: number }>() || { order_index: 1 };

    const result = await db
      .prepare(`
        INSERT INTO modules (module_id, roadmap_id, name, description, order_index)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        moduleId,
        body.roadmap_id,
        body.name,
        body.description || null,
        order_index
      )
      .run();

    const created = await db
      .prepare('SELECT * FROM modules WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<ModuleResponse>();

    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create module', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT /api/admin/roadmap/{roadmapId}/module/{moduleId} - Update module
modules.put('/admin/:roadmapId/module/:moduleId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const body = await c.req.json<Partial<Module>>();
    const db = c.env.DB;

    const existing = await db
      .prepare('SELECT * FROM modules WHERE roadmap_id = ? AND module_id = ?')
      .bind(roadmapId, moduleId)
      .first();

    if (!existing) {
      return errorResponse(c, 'Module not found', 'No module found with this ID', 404);
    }

    await db
      .prepare(`
        UPDATE modules 
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE roadmap_id = ? AND module_id = ?
      `)
      .bind(
        body.name || null,
        body.description || null,
        roadmapId,
        moduleId
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM modules WHERE roadmap_id = ? AND module_id = ?')
      .bind(roadmapId, moduleId)
      .first<ModuleResponse>();

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update module', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE /api/admin/roadmap/{roadmapId}/module/{moduleId} - Delete module
modules.delete('/admin/:roadmapId/module/:moduleId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const db = c.env.DB;

    const existing = await db
      .prepare('SELECT * FROM modules WHERE roadmap_id = ? AND module_id = ?')
      .bind(roadmapId, moduleId)
      .first();

    if (!existing) {
      return errorResponse(c, 'Module not found', 'No module found with this ID', 404);
    }

    await db
      .prepare('DELETE FROM modules WHERE roadmap_id = ? AND module_id = ?')
      .bind(roadmapId, moduleId)
      .run();

    return successResponse(c, { message: 'Module deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete module', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/{roadmapId}/module/{moduleId}/reorder - Reorder modules
modules.post('/admin/:roadmapId/modules/reorder', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const body = await c.req.json<{ module_orders: { module_id: string; order_index: number }[] }>();
    const db = c.env.DB;

    // Update order indexes in a transaction-like manner
    for (const { module_id, order_index } of body.module_orders) {
      await db
        .prepare('UPDATE modules SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE roadmap_id = ? AND module_id = ?')
        .bind(order_index, roadmapId, module_id)
        .run();
    }

    const { results } = await db
      .prepare('SELECT * FROM modules WHERE roadmap_id = ? ORDER BY order_index')
      .bind(roadmapId)
      .all<ModuleResponse>();

    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to reorder modules', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default modules;