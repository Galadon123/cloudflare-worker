import type { Context } from 'hono';
import type { Env } from '../types';

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
  const cfToken = c.req.header('CF-Token');

  if (!cfToken) {
    return c.json(
      { error: 'Unauthorized', message: 'Missing CF-Token header' },
      401
    );
  }

  if (cfToken !== c.env.CLOUDFLARE_API_TOKEN) {
    return c.json(
      { error: 'Unauthorized', message: 'Invalid CF-Token' },
      401
    );
  }

  await next();
};