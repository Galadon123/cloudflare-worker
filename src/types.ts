// Cloudflare Workers environment bindings
export interface Env {
  DB: D1Database;
  CLOUDFLARE_API_TOKEN: string;
}

// Database types
export interface User {
  id: number;
  user_email: string;
  customer_type: 'free' | 'paid';
  compute_count: number;
  enrollment_date: string | null;  // When customer became 'paid', NULL for 'free'
  created_at: string;
  updated_at: string;
}

// API request types
export interface ComputeRequest {
  email: string;
}

export interface UpdateComputeRequest {
  email: string;
  compute_count: number;
  customer_type?: 'free' | 'paid';
}

// API response types
export interface ComputeResponse {
  email: string;
  compute_count: number;
  customer_type: 'free' | 'paid';
  enrollment_date?: string | null;  // When paid subscription started (for calculating expiry)
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface Category {
  name: string;
  slug: string;
}

export interface SubCategory {
  name: string;
  slug: string;
  category_id: number;
}

export interface Chapter {
  name: string;
  slug: string;
  subcategory_id: number;
}

export interface Problem {
  title: string;
  difficulty: string;
  has_tinygraded: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: string;
  collection_type: string;
  repository: string;
  chapter_id: number;
}

export interface Lab {
  title: string;
  difficulty: string;
  has_tinygraded: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: string;
  collection_type: string;
  repository: string;
  chapter_id: number;
}

// Database response types with IDs
export interface CategoryResponse extends Category {
  id: number;
  created_at: string;
}

export interface SubCategoryResponse extends SubCategory {
  id: number;
  created_at: string;
}

export interface ChapterResponse extends Chapter {
  id: number;
  created_at: string;
}

export interface ProblemResponse extends Problem {

}

export interface LabResponse extends Lab {

}

// Collection types for nested structure
export interface CollectionItem {
  name: string;
  id: string;
  title: string;
  difficulty: string;
  category: string;
  has_tinygrad: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: string;
  subcategory: string;
  type: 'problem' | 'lab';
  collectionType: 'problems' | 'labs';
}

export interface CollectionChapter {
  name: string;
  id: string;
  labs: CollectionItem[];
  problems: CollectionItem[];
}

export interface CollectionSubCategory {
  name: string;
  id: string;
  chapters: CollectionChapter[];
}

export interface CollectionCategory {
  name: string;
  id: string;
  subcategories: CollectionSubCategory[];
}

export interface CollectionFilters {
  collectionType?: string | null;
  category?: string | null;
  difficulty?: string | null;
  search?: string | null;
  requiresGpu?: boolean | null;
}

export interface CollectionResponse {
  success: boolean;
  categories: CollectionCategory[];
  count: number;
  filters: CollectionFilters;
}

// Query filters
export interface Filters {
  chapter_id?: string;
  difficulty?: string;
  problem_type?: string;
  requires_gpu?: string;
}

export interface LabFilters extends Filters {}

export interface ProblemFilters extends Filters {}

// Database query result types
export interface DbLabData {
  id: number;
  title: string;
  difficulty: string;
  has_tinygraded: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: string;
  repository: string;
  category_name: string;
  category_slug: string;
  subcategory_name: string;
  subcategory_slug: string;
  chapter_name: string;
  chapter_slug: string;
}

export interface DbProblemData {
  id: number;
  title: string;
  difficulty: string;
  has_tinygraded: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: string;
  repository: string;
  category_name: string;
  category_slug: string;
  subcategory_name: string;
  subcategory_slug: string;
  chapter_name: string;
  chapter_slug: string;
}

// Roadmap system types
export interface Roadmap {
  name: string;
  title: string;
  description?: string;
  level: 'foundation' | 'intermediate' | 'advanced';
  estimated_hours?: number;
  official_docs?: string;
  icon?: string;
}

export interface RoadmapResponse extends Roadmap {
  roadmap_id: string;
  version: string;
  status: 'active' | 'archived' | 'draft';
  last_updated: string;
  module_count: number;
  total_chapters: number;
  total_lessons: number;
  total_labs: number;
  total_problems: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  roadmap_id: string;
  name: string;
  description?: string;
}

export interface ModuleResponse extends Module {
  module_id: string;
  order_index: number;
  chapter_count: number;
  total_lessons: number;
  estimated_hours: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  status: 'live' | 'coming_soon' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface RoadmapChapter {
  roadmap_id: string;
  module_id: string;
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface RoadmapChapterResponse extends RoadmapChapter {
  chapter_id: string;
  order_index: number;
  estimated_hours: number;
  status: 'live' | 'coming_soon' | 'archived';
  lesson_count: number;
  lab_count: number;
  problem_count: number;
  prerequisites: string[];
  learning_objectives: string[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  roadmap_id: string;
  module_id: string;
  chapter_id: string;
  name: string;
  type: 'lesson' | 'lab' | 'problem';
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
  content?: string;
}

export interface LessonResponse extends Lesson {
  lesson_id: string;
  order_index: number;
  status: 'live' | 'coming_soon' | 'archived';
  lab_count: number;
  problem_count: number;
  prerequisites: string[];
  learning_objectives: string[];
  resources: string[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapLab {
  roadmap_id: string;
  module_id: string;
  chapter_id: string;
  lesson_id: string;
  name: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  has_tinygrad: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: 'free' | 'premium';
  estimated_time?: string;
  description?: string;
  instructions?: string;
  starter_code?: string;
  solution?: string;
}

export interface RoadmapLabResponse extends RoadmapLab {
  lab_id: string;
  status: 'live' | 'coming_soon' | 'archived';
  hints: string[];
  resources: string[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapProblem {
  roadmap_id: string;
  module_id: string;
  chapter_id: string;
  lesson_id: string;
  name: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  has_tinygrad: boolean;
  has_pytorch: boolean;
  requires_gpu: boolean;
  problem_type: 'free' | 'premium';
  estimated_time?: string;
  description?: string;
  problem_statement?: string;
  starter_code?: object;
  solution?: object;
}

export interface RoadmapProblemResponse extends RoadmapProblem {
  problem_id: string;
  status: 'live' | 'coming_soon' | 'archived';
  test_cases: any[];
  hints: string[];
  created_at: string;
  updated_at: string;
}