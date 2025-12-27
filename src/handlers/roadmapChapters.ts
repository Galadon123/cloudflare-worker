import { Hono } from 'hono';
import type { Env, RoadmapChapter, RoadmapChapterResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { generateSlug } from '../utils/slugs';

const roadmapChapters = new Hono<{ Bindings: Env }>();

// GET /api/roadmap/{roadmapId}/module/{moduleId}/chapters - Get all chapters
roadmapChapters.get('/:roadmapId/module/:moduleId/chapters', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const db = c.env.DB;

    const { results } = await db
      .prepare(`
        SELECT 
          rc.*,
          COUNT(DISTINCT l.id) as lesson_count,
          COUNT(DISTINCT rl.id) as lab_count,
          COUNT(DISTINCT rp.id) as problem_count,
          JSON(rc.prerequisites) as prerequisites,
          JSON(rc.learning_objectives) as learning_objectives
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

    // Parse JSON fields
    const chaptersWithParsedJson = results.map(chapter => ({
      ...chapter,
      prerequisites: JSON.parse(chapter.prerequisites || '[]'),
      learning_objectives: JSON.parse(chapter.learning_objectives || '[]')
    }));

    return successResponse(c, chaptersWithParsedJson);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch chapters', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET /api/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId} - Get chapter details
roadmapChapters.get('/:roadmapId/module/:moduleId/chapter/:chapterId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const chapterId = c.req.param('chapterId');
    const db = c.env.DB;

    const chapter = await db
      .prepare(`
        SELECT 
          rc.*,
          COUNT(DISTINCT l.id) as lesson_count,
          COUNT(DISTINCT rl.id) as lab_count,
          COUNT(DISTINCT rp.id) as problem_count,
          JSON(rc.prerequisites) as prerequisites,
          JSON(rc.learning_objectives) as learning_objectives
        FROM roadmap_chapters rc
        LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
        LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
        LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
        WHERE rc.roadmap_id = ? AND rc.module_id = ? AND rc.chapter_id = ?
        GROUP BY rc.id
      `)
      .bind(roadmapId, moduleId, chapterId)
      .first();

    if (!chapter) {
      return errorResponse(c, 'Chapter not found', 'No chapter found with this ID', 404);
    }

    // Parse JSON fields
    const chapterWithParsedJson = {
      ...chapter,
      prerequisites: JSON.parse(chapter.prerequisites || '[]'),
      learning_objectives: JSON.parse(chapter.learning_objectives || '[]')
    };

    return successResponse(c, chapterWithParsedJson);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch chapter', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/module/chapter/create - Create chapter (requires roadmap_id and module_id in body)
roadmapChapters.post('/admin/roadmap/module/chapter/create', async (c) => {
  try {
    const body = await c.req.json<RoadmapChapter>();
    const db = c.env.DB;

    // Verify module exists
    const module = await db
      .prepare('SELECT * FROM modules WHERE roadmap_id = ? AND module_id = ?')
      .bind(body.roadmap_id, body.module_id)
      .first();

    if (!module) {
      return errorResponse(c, 'Module not found', 'The specified module does not exist', 404);
    }

    const chapterId = generateSlug(body.name);

    // Get next order index
    const { order_index } = await db
      .prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as order_index FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ?')
      .bind(body.roadmap_id, body.module_id)
      .first<{ order_index: number }>() || { order_index: 1 };

    const result = await db
      .prepare(`
        INSERT INTO roadmap_chapters (chapter_id, module_id, roadmap_id, name, description, difficulty, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        chapterId,
        body.module_id,
        body.roadmap_id,
        body.name,
        body.description || null,
        body.difficulty || null,
        order_index
      )
      .run();

    const created = await db
      .prepare('SELECT * FROM roadmap_chapters WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create chapter', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT /api/admin/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId} - Update chapter
roadmapChapters.put('/admin/:roadmapId/module/:moduleId/chapter/:chapterId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const chapterId = c.req.param('chapterId');
    const body = await c.req.json<Partial<RoadmapChapter>>();
    const db = c.env.DB;

    const existing = await db
      .prepare('SELECT * FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
      .bind(roadmapId, moduleId, chapterId)
      .first();

    if (!existing) {
      return errorResponse(c, 'Chapter not found', 'No chapter found with this ID', 404);
    }

    await db
      .prepare(`
        UPDATE roadmap_chapters 
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            difficulty = COALESCE(?, difficulty),
            updated_at = CURRENT_TIMESTAMP
        WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?
      `)
      .bind(
        body.name || null,
        body.description || null,
        body.difficulty || null,
        roadmapId,
        moduleId,
        chapterId
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
      .bind(roadmapId, moduleId, chapterId)
      .first();

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update chapter', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE /api/admin/roadmap/{roadmapId}/module/{moduleId}/chapter/{chapterId} - Delete chapter
roadmapChapters.delete('/admin/:roadmapId/module/:moduleId/chapter/:chapterId', async (c) => {
  try {
    const roadmapId = c.req.param('roadmapId');
    const moduleId = c.req.param('moduleId');
    const chapterId = c.req.param('chapterId');
    const db = c.env.DB;

    const existing = await db
      .prepare('SELECT * FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
      .bind(roadmapId, moduleId, chapterId)
      .first();

    if (!existing) {
      return errorResponse(c, 'Chapter not found', 'No chapter found with this ID', 404);
    }

    await db
      .prepare('DELETE FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
      .bind(roadmapId, moduleId, chapterId)
      .run();

    return successResponse(c, { message: 'Chapter deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete chapter', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default roadmapChapters;