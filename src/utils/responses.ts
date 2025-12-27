import type { Context } from 'hono';
import type { ErrorResponse } from '../types';

export const errorResponse = (c: Context, error: string, message: string, status: number = 500) => {
  return c.json<ErrorResponse>({ error, message }, status);
};

export const successResponse = (c: Context, data: any, status: number = 200) => {
  return c.json(data, status);
};