import type { 
  Roadmap, RoadmapResponse, 
  Module, ModuleResponse,
  RoadmapChapter, RoadmapChapterResponse,
  Lesson, LessonResponse,
  RoadmapLab, RoadmapLabResponse,
  RoadmapProblem, RoadmapProblemResponse
} from '../types';
import { generateSlug } from '../utils/slugs';

export const createRoadmap = async (db: D1Database, data: Roadmap): Promise<RoadmapResponse | null> => {
  const roadmapId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO roadmaps (roadmap_id, name, title, description, level, estimated_hours, official_docs, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      roadmapId,
      data.name,
      data.title,
      data.description || null,
      data.level,
      data.estimated_hours || 0,
      data.official_docs || null,
      data.icon || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM roadmaps WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<RoadmapResponse>();
};

export const getRoadmapWithCounts = async (db: D1Database, roadmapId: string): Promise<RoadmapResponse | null> => {
  return await db
    .prepare(`
      SELECT 
        r.*,
        COUNT(DISTINCT m.id) as module_count,
        COUNT(DISTINCT rc.id) as total_chapters,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT rl.id) as total_labs,
        COUNT(DISTINCT rp.id) as total_problems
      FROM roadmaps r
      LEFT JOIN modules m ON r.roadmap_id = m.roadmap_id
      LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE r.roadmap_id = ?
      GROUP BY r.id
    `)
    .bind(roadmapId)
    .first<RoadmapResponse>();
};

export const getAllRoadmapsWithCounts = async (db: D1Database): Promise<RoadmapResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT 
        r.*,
        COUNT(DISTINCT m.id) as module_count,
        COUNT(DISTINCT rc.id) as total_chapters,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT rl.id) as total_labs,
        COUNT(DISTINCT rp.id) as total_problems
      FROM roadmaps r
      LEFT JOIN modules m ON r.roadmap_id = m.roadmap_id
      LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE r.status != 'archived'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)
    .all<RoadmapResponse>();

  return results;
};

export const updateRoadmapStatus = async (db: D1Database, roadmapId: string, status: 'active' | 'archived'): Promise<RoadmapResponse | null> => {
  await db
    .prepare('UPDATE roadmaps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE roadmap_id = ?')
    .bind(status, roadmapId)
    .run();

  return await db
    .prepare('SELECT * FROM roadmaps WHERE roadmap_id = ?')
    .bind(roadmapId)
    .first<RoadmapResponse>();
};

export const updateRoadmap = async (db: D1Database, roadmapId: string, data: Partial<Roadmap>): Promise<RoadmapResponse | null> => {
  await db
    .prepare(`
      UPDATE roadmaps 
      SET name = COALESCE(?, name),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          level = COALESCE(?, level),
          estimated_hours = COALESCE(?, estimated_hours),
          official_docs = COALESCE(?, official_docs),
          icon = COALESCE(?, icon),
          updated_at = CURRENT_TIMESTAMP
      WHERE roadmap_id = ?
    `)
    .bind(
      data.name || null,
      data.title || null,
      data.description || null,
      data.level || null,
      data.estimated_hours || null,
      data.official_docs || null,
      data.icon || null,
      roadmapId
    )
    .run();

  return await db
    .prepare('SELECT * FROM roadmaps WHERE roadmap_id = ?')
    .bind(roadmapId)
    .first<RoadmapResponse>();
};

export const deleteRoadmap = async (db: D1Database, roadmapId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM roadmaps WHERE roadmap_id = ?')
    .bind(roadmapId)
    .run();
  return true;
};

export const roadmapExists = async (db: D1Database, roadmapId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM roadmaps WHERE roadmap_id = ?')
    .bind(roadmapId)
    .first();
  return !!result;
};

export const getRoadmap = async (db: D1Database, roadmapId: string): Promise<RoadmapResponse | null> => {
  return await db
    .prepare('SELECT * FROM roadmaps WHERE roadmap_id = ?')
    .bind(roadmapId)
    .first<RoadmapResponse>();
};

export const getRoadmapComplete = async (db: D1Database, roadmapId: string) => {
  // Get roadmap with counts
  const roadmap = await getRoadmapWithCounts(db, roadmapId);
  if (!roadmap) return null;

  // Get all modules with their chapters, lessons, labs, and problems
  const modules = await db
    .prepare(`
      SELECT 
        m.*,
        COUNT(DISTINCT rc.id) as chapter_count,
        COUNT(DISTINCT l.id) as total_lessons,
        COALESCE(SUM(DISTINCT rc.estimated_hours), 0) as estimated_hours
      FROM modules m
      LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      WHERE m.roadmap_id = ?
      GROUP BY m.id
      ORDER BY m.order_index ASC, m.created_at ASC
    `)
    .bind(roadmapId)
    .all();

  const modulesWithDetails = await Promise.all(
    modules.results.map(async (module: any) => {
      // Get chapters for this module
      const chapters = await db
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
          ORDER BY rc.order_index ASC, rc.created_at ASC
        `)
        .bind(roadmapId, module.module_id)
        .all();

      const chaptersWithDetails = await Promise.all(
        chapters.results.map(async (chapter: any) => {
          // Get lessons for this chapter
          const lessons = await db
            .prepare(`
              SELECT 
                l.*,
                COUNT(DISTINCT rl.id) as lab_count,
                COUNT(DISTINCT rp.id) as problem_count
              FROM lessons l
              LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
              LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
              WHERE l.roadmap_id = ? AND l.module_id = ? AND l.chapter_id = ?
              GROUP BY l.id
              ORDER BY l.order_index ASC, l.created_at ASC
            `)
            .bind(roadmapId, module.module_id, chapter.chapter_id)
            .all();

          const lessonsWithDetails = await Promise.all(
            lessons.results.map(async (lesson: any) => {
              // Get labs for this lesson
              const labs = await db
                .prepare(`
                  SELECT * FROM roadmap_labs
                  WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?
                  ORDER BY created_at ASC
                `)
                .bind(roadmapId, module.module_id, chapter.chapter_id, lesson.lesson_id)
                .all();

              // Get problems for this lesson
              const problems = await db
                .prepare(`
                  SELECT * FROM roadmap_problems
                  WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?
                  ORDER BY created_at ASC
                `)
                .bind(roadmapId, module.module_id, chapter.chapter_id, lesson.lesson_id)
                .all();

              return {
                ...lesson,
                labs: labs.results || [],
                problems: problems.results || []
              };
            })
          );

          return {
            ...chapter,
            lessons: lessonsWithDetails
          };
        })
      );

      return {
        ...module,
        chapters: chaptersWithDetails
      };
    })
  );

  return {
    ...roadmap,
    modules: modulesWithDetails
  };
};

// ============================================================================
// MODULE OPERATIONS
// ============================================================================

export const createModule = async (db: D1Database, data: Module): Promise<ModuleResponse | null> => {
  const moduleId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO modules (roadmap_id, module_id, name, description)
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      data.roadmap_id,
      moduleId,
      data.name,
      data.description || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM modules WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<ModuleResponse>();
};

export const getModulesForRoadmap = async (db: D1Database, roadmapId: string): Promise<ModuleResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT 
        m.*,
        COUNT(DISTINCT rc.id) as chapter_count,
        COUNT(DISTINCT l.id) as total_lessons,
        COALESCE(SUM(
          CASE 
            WHEN rc.estimated_hours IS NOT NULL THEN rc.estimated_hours
            ELSE 0
          END
        ), 0) as estimated_hours
      FROM modules m
      LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      WHERE m.roadmap_id = ?
      GROUP BY m.id
      ORDER BY m.order_index ASC, m.created_at ASC
    `)
    .bind(roadmapId)
    .all<ModuleResponse>();

  return results;
};

export const getModule = async (db: D1Database, roadmapId: string, moduleId: string): Promise<ModuleResponse | null> => {
  return await db
    .prepare(`
      SELECT 
        m.*,
        COUNT(DISTINCT rc.id) as chapter_count,
        COUNT(DISTINCT l.id) as total_lessons,
        COALESCE(SUM(
          CASE 
            WHEN rc.estimated_hours IS NOT NULL THEN rc.estimated_hours
            ELSE 0
          END
        ), 0) as estimated_hours
      FROM modules m
      LEFT JOIN roadmap_chapters rc ON m.roadmap_id = rc.roadmap_id AND m.module_id = rc.module_id
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      WHERE m.roadmap_id = ? AND m.module_id = ?
      GROUP BY m.id
    `)
    .bind(roadmapId, moduleId)
    .first<ModuleResponse>();
};

export const updateModule = async (db: D1Database, roadmapId: string, moduleId: string, data: Partial<Module>): Promise<ModuleResponse | null> => {
  await db
    .prepare(`
      UPDATE modules 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE roadmap_id = ? AND module_id = ?
    `)
    .bind(
      data.name || null,
      data.description || null,
      roadmapId,
      moduleId
    )
    .run();

  return await getModule(db, roadmapId, moduleId);
};

export const deleteModule = async (db: D1Database, roadmapId: string, moduleId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM modules WHERE roadmap_id = ? AND module_id = ?')
    .bind(roadmapId, moduleId)
    .run();
  return true;
};

export const moduleExists = async (db: D1Database, roadmapId: string, moduleId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM modules WHERE roadmap_id = ? AND module_id = ?')
    .bind(roadmapId, moduleId)
    .first();
  return !!result;
};

// ============================================================================
// CHAPTER OPERATIONS
// ============================================================================

export const createChapter = async (db: D1Database, data: RoadmapChapter): Promise<RoadmapChapterResponse | null> => {
  const chapterId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO roadmap_chapters (roadmap_id, module_id, chapter_id, name, description, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.roadmap_id,
      data.module_id,
      chapterId,
      data.name,
      data.description || null,
      data.difficulty || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM roadmap_chapters WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<RoadmapChapterResponse>();
};

export const getChaptersForModule = async (db: D1Database, roadmapId: string, moduleId: string): Promise<RoadmapChapterResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT 
        rc.*,
        COUNT(DISTINCT l.id) as lesson_count,
        COUNT(DISTINCT rl.id) as lab_count,
        COUNT(DISTINCT rp.id) as problem_count,
        COALESCE(SUM(
          CASE 
            WHEN l.type = 'lesson' AND l.duration IS NOT NULL 
            THEN CAST(SUBSTR(l.duration, 1, INSTR(l.duration || ' ', ' ') - 1) AS INTEGER)
            ELSE 0
          END
        ), 0) as estimated_hours
      FROM roadmap_chapters rc
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE rc.roadmap_id = ? AND rc.module_id = ?
      GROUP BY rc.id
      ORDER BY rc.order_index ASC, rc.created_at ASC
    `)
    .bind(roadmapId, moduleId)
    .all<RoadmapChapterResponse>();

  return results;
};

export const getChapter = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string): Promise<RoadmapChapterResponse | null> => {
  return await db
    .prepare(`
      SELECT 
        rc.*,
        COUNT(DISTINCT l.id) as lesson_count,
        COUNT(DISTINCT rl.id) as lab_count,
        COUNT(DISTINCT rp.id) as problem_count,
        COALESCE(SUM(
          CASE 
            WHEN l.type = 'lesson' AND l.duration IS NOT NULL 
            THEN CAST(SUBSTR(l.duration, 1, INSTR(l.duration || ' ', ' ') - 1) AS INTEGER)
            ELSE 0
          END
        ), 0) as estimated_hours
      FROM roadmap_chapters rc
      LEFT JOIN lessons l ON rc.roadmap_id = l.roadmap_id AND rc.module_id = l.module_id AND rc.chapter_id = l.chapter_id
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE rc.roadmap_id = ? AND rc.module_id = ? AND rc.chapter_id = ?
      GROUP BY rc.id
    `)
    .bind(roadmapId, moduleId, chapterId)
    .first<RoadmapChapterResponse>();
};

export const updateChapter = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, data: Partial<RoadmapChapter>): Promise<RoadmapChapterResponse | null> => {
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
      data.name || null,
      data.description || null,
      data.difficulty || null,
      roadmapId,
      moduleId,
      chapterId
    )
    .run();

  return await getChapter(db, roadmapId, moduleId, chapterId);
};

export const deleteChapter = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
    .bind(roadmapId, moduleId, chapterId)
    .run();
  return true;
};

export const chapterExists = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM roadmap_chapters WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ?')
    .bind(roadmapId, moduleId, chapterId)
    .first();
  return !!result;
};

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

export const createLesson = async (db: D1Database, data: Lesson): Promise<LessonResponse | null> => {
  const lessonId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO lessons (roadmap_id, module_id, chapter_id, lesson_id, name, type, duration, difficulty, description, content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.roadmap_id,
      data.module_id,
      data.chapter_id,
      lessonId,
      data.name,
      data.type || 'lesson',
      data.duration || null,
      data.difficulty || null,
      data.description || null,
      data.content || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM lessons WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<LessonResponse>();
};

export const getLessonsForChapter = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string): Promise<LessonResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT 
        l.*,
        COUNT(DISTINCT rl.id) as lab_count,
        COUNT(DISTINCT rp.id) as problem_count
      FROM lessons l
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE l.roadmap_id = ? AND l.module_id = ? AND l.chapter_id = ?
      GROUP BY l.id
      ORDER BY l.order_index ASC, l.created_at ASC
    `)
    .bind(roadmapId, moduleId, chapterId)
    .all<LessonResponse>();

  return results;
};

export const getLesson = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string): Promise<LessonResponse | null> => {
  return await db
    .prepare(`
      SELECT 
        l.*,
        COUNT(DISTINCT rl.id) as lab_count,
        COUNT(DISTINCT rp.id) as problem_count
      FROM lessons l
      LEFT JOIN roadmap_labs rl ON l.roadmap_id = rl.roadmap_id AND l.module_id = rl.module_id AND l.chapter_id = rl.chapter_id AND l.lesson_id = rl.lesson_id
      LEFT JOIN roadmap_problems rp ON l.roadmap_id = rp.roadmap_id AND l.module_id = rp.module_id AND l.chapter_id = rp.chapter_id AND l.lesson_id = rp.lesson_id
      WHERE l.roadmap_id = ? AND l.module_id = ? AND l.chapter_id = ? AND l.lesson_id = ?
      GROUP BY l.id
    `)
    .bind(roadmapId, moduleId, chapterId, lessonId)
    .first<LessonResponse>();
};

export const updateLesson = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, data: Partial<Lesson>): Promise<LessonResponse | null> => {
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
      data.name || null,
      data.type || null,
      data.duration || null,
      data.difficulty || null,
      data.description || null,
      data.content || null,
      roadmapId,
      moduleId,
      chapterId,
      lessonId
    )
    .run();

  return await getLesson(db, roadmapId, moduleId, chapterId, lessonId);
};

export const deleteLesson = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId)
    .run();
  return true;
};

export const lessonExists = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM lessons WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId)
    .first();
  return !!result;
};

// ============================================================================
// LAB OPERATIONS
// ============================================================================

export const createLab = async (db: D1Database, data: RoadmapLab): Promise<RoadmapLabResponse | null> => {
  const labId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO roadmap_labs (
        roadmap_id, module_id, chapter_id, lesson_id, lab_id, name, title, 
        difficulty, has_tinygrad, has_pytorch, requires_gpu, problem_type,
        estimated_time, description, instructions, starter_code, solution
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.roadmap_id,
      data.module_id,
      data.chapter_id,
      data.lesson_id,
      labId,
      data.name,
      data.title,
      data.difficulty || null,
      data.has_tinygrad,
      data.has_pytorch,
      data.requires_gpu,
      data.problem_type,
      data.estimated_time || null,
      data.description || null,
      data.instructions || null,
      data.starter_code || null,
      data.solution || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM roadmap_labs WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<RoadmapLabResponse>();
};

export const getLabsForLesson = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string): Promise<RoadmapLabResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT * FROM roadmap_labs
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?
      ORDER BY created_at ASC
    `)
    .bind(roadmapId, moduleId, chapterId, lessonId)
    .all<RoadmapLabResponse>();

  return results;
};

export const getLab = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, labId: string): Promise<RoadmapLabResponse | null> => {
  return await db
    .prepare(`
      SELECT * FROM roadmap_labs
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?
    `)
    .bind(roadmapId, moduleId, chapterId, lessonId, labId)
    .first<RoadmapLabResponse>();
};

export const updateLab = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, labId: string, data: Partial<RoadmapLab>): Promise<RoadmapLabResponse | null> => {
  await db
    .prepare(`
      UPDATE roadmap_labs 
      SET name = COALESCE(?, name),
          title = COALESCE(?, title),
          difficulty = COALESCE(?, difficulty),
          has_tinygrad = COALESCE(?, has_tinygrad),
          has_pytorch = COALESCE(?, has_pytorch),
          requires_gpu = COALESCE(?, requires_gpu),
          problem_type = COALESCE(?, problem_type),
          estimated_time = COALESCE(?, estimated_time),
          description = COALESCE(?, description),
          instructions = COALESCE(?, instructions),
          starter_code = COALESCE(?, starter_code),
          solution = COALESCE(?, solution),
          updated_at = CURRENT_TIMESTAMP
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?
    `)
    .bind(
      data.name || null,
      data.title || null,
      data.difficulty || null,
      data.has_tinygrad !== undefined ? data.has_tinygrad : null,
      data.has_pytorch !== undefined ? data.has_pytorch : null,
      data.requires_gpu !== undefined ? data.requires_gpu : null,
      data.problem_type || null,
      data.estimated_time || null,
      data.description || null,
      data.instructions || null,
      data.starter_code || null,
      data.solution || null,
      roadmapId,
      moduleId,
      chapterId,
      lessonId,
      labId
    )
    .run();

  return await getLab(db, roadmapId, moduleId, chapterId, lessonId, labId);
};

export const deleteLab = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, labId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId, labId)
    .run();
  return true;
};

export const labExists = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, labId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM roadmap_labs WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND lab_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId, labId)
    .first();
  return !!result;
};

// ============================================================================
// PROBLEM OPERATIONS
// ============================================================================

export const createProblem = async (db: D1Database, data: RoadmapProblem): Promise<RoadmapProblemResponse | null> => {
  const problemId = generateSlug(data.name);

  const result = await db
    .prepare(`
      INSERT INTO roadmap_problems (
        roadmap_id, module_id, chapter_id, lesson_id, problem_id, name, title,
        difficulty, has_tinygrad, has_pytorch, requires_gpu, problem_type,
        estimated_time, description, problem_statement, starter_code, solution
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.roadmap_id,
      data.module_id,
      data.chapter_id,
      data.lesson_id,
      problemId,
      data.name,
      data.title,
      data.difficulty || null,
      data.has_tinygrad,
      data.has_pytorch,
      data.requires_gpu,
      data.problem_type,
      data.estimated_time || null,
      data.description || null,
      data.problem_statement || null,
      JSON.stringify(data.starter_code) || null,
      JSON.stringify(data.solution) || null
    )
    .run();

  return await db
    .prepare('SELECT * FROM roadmap_problems WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<RoadmapProblemResponse>();
};

export const getProblemsForLesson = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string): Promise<RoadmapProblemResponse[]> => {
  const { results } = await db
    .prepare(`
      SELECT * FROM roadmap_problems
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ?
      ORDER BY created_at ASC
    `)
    .bind(roadmapId, moduleId, chapterId, lessonId)
    .all<RoadmapProblemResponse>();

  return results;
};

export const getProblem = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, problemId: string): Promise<RoadmapProblemResponse | null> => {
  return await db
    .prepare(`
      SELECT * FROM roadmap_problems
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?
    `)
    .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
    .first<RoadmapProblemResponse>();
};

export const updateProblem = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, problemId: string, data: Partial<RoadmapProblem>): Promise<RoadmapProblemResponse | null> => {
  await db
    .prepare(`
      UPDATE roadmap_problems 
      SET name = COALESCE(?, name),
          title = COALESCE(?, title),
          difficulty = COALESCE(?, difficulty),
          has_tinygrad = COALESCE(?, has_tinygrad),
          has_pytorch = COALESCE(?, has_pytorch),
          requires_gpu = COALESCE(?, requires_gpu),
          problem_type = COALESCE(?, problem_type),
          estimated_time = COALESCE(?, estimated_time),
          description = COALESCE(?, description),
          problem_statement = COALESCE(?, problem_statement),
          starter_code = COALESCE(?, starter_code),
          solution = COALESCE(?, solution),
          updated_at = CURRENT_TIMESTAMP
      WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?
    `)
    .bind(
      data.name || null,
      data.title || null,
      data.difficulty || null,
      data.has_tinygrad !== undefined ? data.has_tinygrad : null,
      data.has_pytorch !== undefined ? data.has_pytorch : null,
      data.requires_gpu !== undefined ? data.requires_gpu : null,
      data.problem_type || null,
      data.estimated_time || null,
      data.description || null,
      data.problem_statement || null,
      data.starter_code ? JSON.stringify(data.starter_code) : null,
      data.solution ? JSON.stringify(data.solution) : null,
      roadmapId,
      moduleId,
      chapterId,
      lessonId,
      problemId
    )
    .run();

  return await getProblem(db, roadmapId, moduleId, chapterId, lessonId, problemId);
};

export const deleteProblem = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, problemId: string): Promise<boolean> => {
  await db
    .prepare('DELETE FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
    .run();
  return true;
};

export const problemExists = async (db: D1Database, roadmapId: string, moduleId: string, chapterId: string, lessonId: string, problemId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT 1 FROM roadmap_problems WHERE roadmap_id = ? AND module_id = ? AND chapter_id = ? AND lesson_id = ? AND problem_id = ?')
    .bind(roadmapId, moduleId, chapterId, lessonId, problemId)
    .first();
  return !!result;
};

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

interface SearchFilters {
  q?: string;
  type?: 'lesson' | 'lab' | 'problem';
  difficulty?: 'easy' | 'medium' | 'hard';
  roadmapId?: string;
  has_pytorch?: boolean;
  has_tinygrad?: boolean;
  requires_gpu?: boolean;
}

interface SearchResult {
  type: 'lesson' | 'lab' | 'problem';
  roadmap_id: string;
  module_id: string;
  chapter_id: string;
  lesson_id: string;
  id: string;
  name: string;
  title?: string;
  difficulty?: string;
  has_pytorch?: boolean;
  has_tinygrad?: boolean;
  requires_gpu?: boolean;
  problem_type?: string;
  description?: string;
  created_at: string;
}

export const searchContent = async (db: D1Database, filters: SearchFilters): Promise<SearchResult[]> => {
  let query = `
    SELECT 'lesson' as type, roadmap_id, module_id, chapter_id, lesson_id, lesson_id as id, 
           name, NULL as title, difficulty, NULL as has_pytorch, NULL as has_tinygrad, 
           NULL as requires_gpu, NULL as problem_type, description, created_at
    FROM lessons
    WHERE 1=1
  `;
  
  const queryParams: any[] = [];
  
  if (filters.q) {
    query += ` AND (name LIKE ? OR description LIKE ?)`;
    queryParams.push(`%${filters.q}%`, `%${filters.q}%`);
  }
  
  if (filters.difficulty) {
    query += ` AND difficulty = ?`;
    queryParams.push(filters.difficulty);
  }
  
  if (filters.roadmapId) {
    query += ` AND roadmap_id = ?`;
    queryParams.push(filters.roadmapId);
  }
  
  if (!filters.type || filters.type === 'lab') {
    query += ` UNION ALL
      SELECT 'lab' as type, roadmap_id, module_id, chapter_id, lesson_id, lab_id as id,
             name, title, difficulty, has_pytorch, has_tinygrad, requires_gpu, problem_type, description, created_at
      FROM roadmap_labs
      WHERE 1=1
    `;
    
    if (filters.q) {
      query += ` AND (name LIKE ? OR title LIKE ? OR description LIKE ?)`;
      queryParams.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }
    
    if (filters.difficulty) {
      query += ` AND difficulty = ?`;
      queryParams.push(filters.difficulty);
    }
    
    if (filters.roadmapId) {
      query += ` AND roadmap_id = ?`;
      queryParams.push(filters.roadmapId);
    }
    
    if (filters.has_pytorch !== undefined) {
      query += ` AND has_pytorch = ?`;
      queryParams.push(filters.has_pytorch);
    }
    
    if (filters.has_tinygrad !== undefined) {
      query += ` AND has_tinygrad = ?`;
      queryParams.push(filters.has_tinygrad);
    }
    
    if (filters.requires_gpu !== undefined) {
      query += ` AND requires_gpu = ?`;
      queryParams.push(filters.requires_gpu);
    }
  }
  
  if (!filters.type || filters.type === 'problem') {
    query += ` UNION ALL
      SELECT 'problem' as type, roadmap_id, module_id, chapter_id, lesson_id, problem_id as id,
             name, title, difficulty, has_pytorch, has_tinygrad, requires_gpu, problem_type, description, created_at
      FROM roadmap_problems
      WHERE 1=1
    `;
    
    if (filters.q) {
      query += ` AND (name LIKE ? OR title LIKE ? OR description LIKE ?)`;
      queryParams.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
    }
    
    if (filters.difficulty) {
      query += ` AND difficulty = ?`;
      queryParams.push(filters.difficulty);
    }
    
    if (filters.roadmapId) {
      query += ` AND roadmap_id = ?`;
      queryParams.push(filters.roadmapId);
    }
    
    if (filters.has_pytorch !== undefined) {
      query += ` AND has_pytorch = ?`;
      queryParams.push(filters.has_pytorch);
    }
    
    if (filters.has_tinygrad !== undefined) {
      query += ` AND has_tinygrad = ?`;
      queryParams.push(filters.has_tinygrad);
    }
    
    if (filters.requires_gpu !== undefined) {
      query += ` AND requires_gpu = ?`;
      queryParams.push(filters.requires_gpu);
    }
  }
  
  if (filters.type) {
    query = `SELECT * FROM (${query}) WHERE type = ?`;
    queryParams.push(filters.type);
  }
  
  query += ` ORDER BY created_at DESC LIMIT 100`;
  
  const { results } = await db.prepare(query).bind(...queryParams).all<SearchResult>();
  return results;
};