import type { 
  DbLabData, 
  DbProblemData, 
  CollectionItem,
  CollectionChapter,
  CollectionSubCategory,
  CollectionCategory,
  CollectionResponse
} from '../types';

interface CollectionFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  requiresGpu?: string;
  collectionType?: string;
}

export const buildCollectionResponse = async (
  db: D1Database,
  filters: CollectionFilters
): Promise<CollectionResponse> => {
  const labFilters: string[] = [];
  const problemFilters: string[] = [];
  const labParams: (string | boolean)[] = [];
  const problemParams: (string | boolean)[] = [];

  if (filters.difficulty) {
    labFilters.push('l.difficulty = ?');
    problemFilters.push('p.difficulty = ?');
    labParams.push(filters.difficulty);
    problemParams.push(filters.difficulty);
  }

  if (filters.search) {
    labFilters.push('l.title LIKE ?');
    problemFilters.push('p.title LIKE ?');
    labParams.push(`%${filters.search}%`);
    problemParams.push(`%${filters.search}%`);
  }

  if (filters.requiresGpu !== undefined) {
    labFilters.push('l.requires_gpu = ?');
    problemFilters.push('p.requires_gpu = ?');
    labParams.push(filters.requiresGpu === 'true');
    problemParams.push(filters.requiresGpu === 'true');
  }

  if (filters.category) {
    labFilters.push('cat.name LIKE ?');
    problemFilters.push('cat.name LIKE ?');
    labParams.push(`%${filters.category}%`);
    problemParams.push(`%${filters.category}%`);
  }

  const labWhere = labFilters.length > 0 ? 'AND ' + labFilters.join(' AND ') : '';
  const problemWhere = problemFilters.length > 0 ? 'AND ' + problemFilters.join(' AND ') : '';

  let labsData: DbLabData[] = [];
  if (filters.collectionType !== 'problems') {
    const labsQuery = `
      SELECT 
        l.*,
        cat.name as category_name,
        cat.slug as category_slug,
        sc.name as subcategory_name,
        sc.slug as subcategory_slug,
        ch.name as chapter_name,
        ch.slug as chapter_slug
      FROM labs l
      INNER JOIN chapters ch ON l.chapter_id = ch.id
      INNER JOIN subcategories sc ON ch.subcategory_id = sc.id
      INNER JOIN categories cat ON sc.category_id = cat.id
      WHERE 1=1 ${labWhere}
      ORDER BY cat.created_at, sc.created_at, ch.created_at, l.created_at
    `;

    const labStmt = db.prepare(labsQuery);
    const labResults = labParams.length > 0 
      ? await labStmt.bind(...labParams).all<DbLabData>() 
      : await labStmt.all<DbLabData>();
    labsData = (labResults.results || []) as DbLabData[];
  }

  let problemsData: DbProblemData[] = [];
  if (filters.collectionType !== 'labs') {
    const problemsQuery = `
      SELECT 
        p.*,
        cat.name as category_name,
        cat.slug as category_slug,
        sc.name as subcategory_name,
        sc.slug as subcategory_slug,
        ch.name as chapter_name,
        ch.slug as chapter_slug
      FROM problems p
      INNER JOIN chapters ch ON p.chapter_id = ch.id
      INNER JOIN subcategories sc ON ch.subcategory_id = sc.id
      INNER JOIN categories cat ON sc.category_id = cat.id
      WHERE 1=1 ${problemWhere}
      ORDER BY cat.created_at, sc.created_at, ch.created_at, p.created_at
    `;

    const problemStmt = db.prepare(problemsQuery);
    const problemResults = problemParams.length > 0 
      ? await problemStmt.bind(...problemParams).all<DbProblemData>() 
      : await problemStmt.all<DbProblemData>();
    problemsData = (problemResults.results || []) as DbProblemData[];
  }

  return buildNestedStructure(labsData, problemsData, filters);
};

const buildNestedStructure = (
  labsData: DbLabData[],
  problemsData: DbProblemData[],
  filters: CollectionFilters
): CollectionResponse => {
  interface NestedChapter {
    name: string;
    id: string;
    labs: CollectionItem[];
    problems: CollectionItem[];
  }

  interface NestedSubCategory {
    name: string;
    id: string;
    chapters: Record<string, NestedChapter>;
  }

  interface NestedCategory {
    name: string;
    id: string;
    subcategories: Record<string, NestedSubCategory>;
  }

  const categoriesDict: Record<string, NestedCategory> = {};

  for (const lab of labsData) {
    const catSlug = lab.category_slug;
    const scSlug = lab.subcategory_slug;
    const chSlug = lab.chapter_slug;

    if (!categoriesDict[catSlug]) {
      categoriesDict[catSlug] = {
        name: lab.category_name,
        id: catSlug,
        subcategories: {}
      };
    }

    if (!categoriesDict[catSlug].subcategories[scSlug]) {
      categoriesDict[catSlug].subcategories[scSlug] = {
        name: lab.subcategory_name,
        id: scSlug,
        chapters: {}
      };
    }

    if (!categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug]) {
      categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug] = {
        name: lab.chapter_name,
        id: chSlug,
        labs: [],
        problems: []
      };
    }

    const labItem: CollectionItem = {
      name: lab.repository,
      id: String(lab.id),
      title: lab.title,
      difficulty: lab.difficulty,
      category: lab.category_name,
      has_tinygrad: lab.has_tinygraded,
      has_pytorch: lab.has_pytorch,
      requires_gpu: lab.requires_gpu,
      problem_type: lab.problem_type,
      subcategory: lab.subcategory_name,
      type: 'lab',
      collectionType: 'labs'
    };

    categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug].labs.push(labItem);
  }

  for (const problem of problemsData) {
    const catSlug = problem.category_slug;
    const scSlug = problem.subcategory_slug;
    const chSlug = problem.chapter_slug;

    if (!categoriesDict[catSlug]) {
      categoriesDict[catSlug] = {
        name: problem.category_name,
        id: catSlug,
        subcategories: {}
      };
    }

    if (!categoriesDict[catSlug].subcategories[scSlug]) {
      categoriesDict[catSlug].subcategories[scSlug] = {
        name: problem.subcategory_name,
        id: scSlug,
        chapters: {}
      };
    }

    if (!categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug]) {
      categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug] = {
        name: problem.chapter_name,
        id: chSlug,
        labs: [],
        problems: []
      };
    }

    const problemItem: CollectionItem = {
      name: problem.repository,
      id: String(problem.id),
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category_name,
      has_tinygrad: problem.has_tinygraded,
      has_pytorch: problem.has_pytorch,
      requires_gpu: problem.requires_gpu,
      problem_type: problem.problem_type,
      subcategory: problem.subcategory_name,
      type: 'problem',
      collectionType: 'problems'
    };

    categoriesDict[catSlug].subcategories[scSlug].chapters[chSlug].problems.push(problemItem);
  }

  const resultCategories: CollectionCategory[] = [];
  let totalCount = 0;

  for (const catSlug in categoriesDict) {
    const catData = categoriesDict[catSlug];
    const subcategoriesList: CollectionSubCategory[] = [];

    for (const scSlug in catData.subcategories) {
      const scData = catData.subcategories[scSlug];
      const chaptersList: CollectionChapter[] = [];

      for (const chSlug in scData.chapters) {
        const chData = scData.chapters[chSlug];

        if (chData.labs.length > 0 || chData.problems.length > 0) {
          totalCount += chData.labs.length + chData.problems.length;
          chaptersList.push({
            name: chData.name,
            id: chData.id,
            labs: chData.labs,
            problems: chData.problems
          });
        }
      }

      if (chaptersList.length > 0) {
        subcategoriesList.push({
          name: scData.name,
          id: scData.id,
          chapters: chaptersList
        });
      }
    }

    if (subcategoriesList.length > 0) {
      resultCategories.push({
        name: catData.name,
        id: catData.id,
        subcategories: subcategoriesList
      });
    }
  }

  return {
    success: true,
    categories: resultCategories,
    count: totalCount,
    filters: {
      collectionType: filters.collectionType || null,
      category: filters.category || null,
      difficulty: filters.difficulty || null,
      search: filters.search || null,
      requiresGpu: filters.requiresGpu === 'true' ? true : filters.requiresGpu === 'false' ? false : null
    }
  };
};