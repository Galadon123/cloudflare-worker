import { Hono } from 'hono';
import type { Env, RoadmapProblem, RoadmapProblemResponse } from '../types';
import { errorResponse, successResponse } from '../utils/responses';
import { generateUniqueId } from '../utils/slugs';

const roadmapProblems = new Hono<{ Bindings: Env }>();

// GET problems for lesson
roadmapProblems.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/problems', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId } = c.req.param();
    const db = c.env.DB;

    const { results } = await db
      .prepare('SELECT * FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? ORDER BY created_at')
      .bind(roadmapId, moduleId, chapterId, lessonId)
      .all<RoadmapProblemResponse>();

    return successResponse(c, results);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch problems', error instanceof Error ? error.message : 'Unknown error');
  }
});

// GET specific problem
roadmapProblems.get('/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/problem/:problemId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, problemId } = c.req.param();
    const db = c.env.DB;

    const problem = await db
      .prepare('SELECT * FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
      .first<RoadmapProblemResponse>();

    if (!problem) {
      return errorResponse(c, 'Problem not found', 'No problem found with this ID', 404);
    }

    return successResponse(c, problem);
  } catch (error) {
    return errorResponse(c, 'Failed to fetch problem', error instanceof Error ? error.message : 'Unknown error');
  }
});

// POST /api/admin/roadmap/module/chapter/lesson/problem/create - Create problem (requires roadmap_id, module_id, chapter_id, lesson_id in body)
roadmapProblems.post('/admin/roadmap/module/chapter/lesson/problem/create', async (c) => {
  try {
    const body = await c.req.json<RoadmapProblem>();
    const db = c.env.DB;

    const problemId = generateUniqueId(body.name, Date.now().toString());

    const result = await db
      .prepare(`
        INSERT INTO roadmap_problems 
        (problem_id, lesson_id, chapter_id, module_id, roadmap_id, name, title, difficulty, has_tinygrad, has_pytorch, requires_gpu, problem_type, estimated_time, description, problem_statement, starter_code, solution)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        problemId,
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
        body.problem_statement || null,
        JSON.stringify(body.starter_code || {}),
        JSON.stringify(body.solution || {})
      )
      .run();

    const created = await db
      .prepare('SELECT * FROM roadmap_problems WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<RoadmapProblemResponse>();

    return successResponse(c, created, 201);
  } catch (error) {
    return errorResponse(c, 'Failed to create problem', error instanceof Error ? error.message : 'Unknown error', 400);
  }
});

// PUT update problem
roadmapProblems.put('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/problem/:problemId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, problemId } = c.req.param();
    const body = await c.req.json<Partial<RoadmapProblem>>();
    const db = c.env.DB;

    await db
      .prepare(`
        UPDATE roadmap_problems 
        SET title = COALESCE(?, title),
            difficulty = COALESCE(?, difficulty),
            description = COALESCE(?, description),
            problem_statement = COALESCE(?, problem_statement),
            starter_code = COALESCE(?, starter_code),
            solution = COALESCE(?, solution),
            updated_at = CURRENT_TIMESTAMP
        WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?
      `)
      .bind(
        body.title || null,
        body.difficulty || null,
        body.description || null,
        body.problem_statement || null,
        body.starter_code ? JSON.stringify(body.starter_code) : null,
        body.solution ? JSON.stringify(body.solution) : null,
        roadmapId, moduleId, chapterId, lessonId, problemId
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
      .first<RoadmapProblemResponse>();

    return successResponse(c, updated);
  } catch (error) {
    return errorResponse(c, 'Failed to update problem', error instanceof Error ? error.message : 'Unknown error');
  }
});

// DELETE problem
roadmapProblems.delete('/admin/:roadmapId/module/:moduleId/chapter/:chapterId/lesson/:lessonId/problem/:problemId', async (c) => {
  try {
    const { roadmapId, moduleId, chapterId, lessonId, problemId } = c.req.param();
    const db = c.env.DB;

    await db
      .prepare('DELETE FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?')
      .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
      .run();

    return successResponse(c, { message: 'Problem deleted successfully' });
  } catch (error) {
    return errorResponse(c, 'Failed to delete problem', error instanceof Error ? error.message : 'Unknown error');
  }
});

export default roadmapProblems;