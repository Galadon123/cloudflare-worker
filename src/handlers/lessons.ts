import { Hono } from 'hono';
import type { Env, Lesson, LessonResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { generateSlug } from '../utils/slugs';

const lessons = new Hono<{ Bindings: Env }>();

// GET /api/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId}/lessons
lessons.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lessons', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId } = c.req.param();
    const db = c.env.DB;

    const { results } = await db
      .prepare(`
        SELECT 
          l.*,
          COUNT(DISTINCT rl.id) as lab_count,
          COUNT(DISTINCT rp.id) as problem_count,
          JSON(l.prerequisites) as prerequisites,
          JSON(l.learning_objectives) as learning_objectives,
          JSON(l.resources) as resources
        FROM lessons l
        LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
        LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
        WHERE l.roadmap_id = ? AND l.module_id = ? AND l.chapter_id = ?
        GROUP BY l.id
        ORDER BY l.order_index, l.created_at
      `)
      .bind(roadmapId, moduleId, chapterId)
      .all();

    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch lessons', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET /api/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId}/lesson/{lessonId}
lessons.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId } = c.req.param();
    const db = c.env.DB;

    const lesson = await db
      .prepare('SELECT * FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId)
      .first<LessonResponse>();

    if (!lesson) {
      return errorResponse(c, 'Lesson not found', 'No lesson found with this ID', 404);
    }

    return successResponse(c, lesson);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch lesson', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/module/chapter/lesson/create - Create lesson (requires roadmap_id, module_id, chapter_id in body)
lessons.post('/admin/roadmap/module/chapter/lesson/create', async (c) => {
  try {
    const body = await c.req.json<Lesson>();
    const db = c.env.DB;

    const lessonId = generateSlug(body.name);

    const { order_index } = await db
      .prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as order_index FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
      .bind(body.roadmap_id, body.module_id, body.chapter_id)
      .first<{ order_index: number }>() || { order_index: 1 };

    const result = await db
      .prepare(`
        INSERT INTO lessons (lesson_id, chapter_id, module_id, roadmap_id, name, type, duration, difficulty, description, content, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        lessonId,
        body.chapter_id,
        body.module_id,
        body.roadmap_id,
        body.name,
        body.type,
        body.duration || null,
        body.difficulty || null,
        body.description || null,
        body.content || null,
        order_index
      )
      .run();

    const created = await db
      .prepare('SELECT * FROM lessons WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<LessonResponse>();

    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create lesson', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT /api/admin/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId}/lesson/{lessonId}
lessons.put('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId } = c.req.param();
    const body = await c.req.json<Partial<Lesson>>();
    const db = c.env.DB;

    await db
      .prepare(`
        UPDATE lessons 
        SET name = COALESCE(?, name),
            type = COALESCE(?, type),
            duration = COALESCE(?, duration),
            difficulty = COALESCE(?, difficulty),
            description = COALESCE(?, description),
            content = COALESCE(?, content),
            updated_at = CURRENT_TIMESTAMP
        WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?
      `)
      .bind(
        body.name || null,
        body.type || null,
        body.duration || null,
        body.difficulty || null,
        body.description || null,
        body.content || null,
        roadmapId, moduleId, chapterId, lessonId
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId)
      .first<LessonResponse>();

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update lesson', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE /api/admin/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId}/lesson/{lessonId}
lessons.delete('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId } = c.req.param();
    const db = c.env.DB;

    await db
      .prepare('DELETE FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId)
      .run();

    return successResponse(c, { message: 'Lesson deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete lesson', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default lessons;