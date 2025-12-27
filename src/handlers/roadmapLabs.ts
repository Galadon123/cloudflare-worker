import { Hono } from 'hono';
import type { Env, RoadmapLab, RoadmapLabResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { generateUniqueId } from '../utils/slugs';

const roadmapLabs = new Hono<{ Bindings: Env }>();

// GET labs for lesson
roadmapLabs.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/labs', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId } = c.req.param();
    const db = c.env.DB;

    const { results } = await db
      .prepare('SELECT * FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? ORDER BY created_at')
      .bind(roadmapId, moduleId, chapterId, lessonId)
      .all<RoadmapLabResponse>();

    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch labs', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET specific lab
roadmapLabs.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/lab/:labId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, labId } = c.req.param();
    const db = c.env.DB;

    const lab = await db
      .prepare('SELECT * FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, labId)
      .first<RoadmapLabResponse>();

    if (!lab) {
      return errorResponse(c, 'Lab not found', 'No lab found with this ID', 404);
    }

    return successResponse(c, lab);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch lab', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/module/chapter/lesson/lab/create - Create lab (requires roadmap_id, module_id, chapter_id, lesson_id in body)
roadmapLabs.post('/admin/roadmap/module/chapter/lesson/lab/create', async (c) => {
  try {
    const body = await c.req.json<RoadmapLab>();
    const db = c.env.DB;

    const labId = generateUniqueId(body.name, Date.now().toString());

    const result = await db
      .prepare(`
        INSERT INTO roadmap_labs 
        (lab_id, lesson_id, chapter_id, module_id, roadmap_id, name, title, difficulty, has_tinygrad, has_pytorch, requires_gpu, problem_type, estimated_time, description, instructions, starter_code, solution)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        labId,
        body.lesson_id,
        body.chapter_id,
        body.module_id,
        body.roadmap_id,
        body.name,
        body.title,
        body.difficulty || null,
        body.has_tinygrad ? 1 : 0,
        body.has_pytorch ? 1 : 0,
        body.requires_gpu ? 1 : 0,
        body.problem_type,
        body.estimated_time || null,
        body.description || null,
        body.instructions || null,
        body.starter_code || null,
        body.solution || null
      )
      .run();

    const created = await db
      .prepare('SELECT * FROM roadmap_labs WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<RoadmapLabResponse>();

    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create lab', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT update lab
roadmapLabs.put('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/lab/:labId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, labId } = c.req.param();
    const body = await c.req.json<Partial<RoadmapLab>>();
    const db = c.env.DB;

    await db
      .prepare(`
        UPDATE roadmap_labs 
        SET title = COALESCE(?, title),
            difficulty = COALESCE(?, difficulty),
            description = COALESCE(?, description),
            instructions = COALESCE(?, instructions),
            starter_code = COALESCE(?, starter_code),
            solution = COALESCE(?, solution),
            updated_at = CURRENT_TIMESTAMP
        WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?
      `)
      .bind(
        body.title || null,
        body.difficulty || null,
        body.description || null,
        body.instructions || null,
        body.starter_code || null,
        body.solution || null,
        roadmapId, moduleId, chapterId, lessonId, labId
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, labId)
      .first<RoadmapLabResponse>();

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update lab', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE lab
roadmapLabs.delete('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/lab/:labId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, labId } = c.req.param();
    const db = c.env.DB;

    await db
      .prepare('DELETE FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, labId)
      .run();

    return successResponse(c, { message: 'Lab deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete lab', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default roadmapLabs;