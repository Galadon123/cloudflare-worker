import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { authMiddleware } from './middleware/auth';
import compute from './handlers/compute';
import categories from './handlers/categories';
import subcategories from './handlers/subcategories';
import chapters from './handlers/chapters';
import problems from './handlers/problems';
import labs from './handlers/labs';
import collections from './handlers/collections';
import roadmaps from './handlers/roadmaps';
import modules from './handlers/modules';
import roadmapChapters from './handlers/roadmapChapters';
import lessons from './handlers/lessons';
import roadmapLabs from './handlers/roadmapLabs';
import roadmapProblems from './handlers/roadmapProblems';
import search from './handlers/search';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// Apply auth middleware to ALL routes including health check
app.use('/*', authMiddleware);

// Health check (requires auth)
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'TensorCode CF Worker is running' });
});

// Roadmap APIs (all require auth)
app.route('/api/roadmaps', roadmaps);
app.route('/api/roadmap', roadmaps);
app.route('/api/roadmap', modules);
app.route('/api/roadmap', roadmapChapters);
app.route('/api/roadmap', lessons);
app.route('/api/roadmap', roadmapLabs);
app.route('/api/roadmap', roadmapProblems);
app.route('/api/search', search);

// Admin roadmap APIs (auth required)
// Mount admin routes - handlers already include /admin prefix
app.route('/api', roadmaps);
app.route('/api', modules);
app.route('/api', roadmapChapters);
app.route('/api', lessons);
app.route('/api', roadmapLabs);
app.route('/api', roadmapProblems);

// Existing APIs (auth required)
app.route('/compute', compute);
app.route('/categories', categories);
app.route('/subcategories', subcategories);
app.route('/chapters', chapters);
app.route('/problems', problems);
app.route('/labs', labs);
app.route('/collections', collections);

export default app;
