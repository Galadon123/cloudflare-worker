import type { User } from '../types';
import { hasEnrollmentExpired } from '../utils/validation';

export const createUser = async (db: D1Database, email: string): Promise<User | null> => {
  await db
    .prepare('INSERT INTO users (user_email, customer_type, compute_count) VALUES (?, ?, ?)')
    .bind(email, 'free', 100)
    .run();

  return await db
    .prepare('SELECT user_email, customer_type, compute_count, enrollment_date FROM users WHERE user_email = ?')
    .bind(email)
    .first<User>();
};

export const getOrCreateUser = async (db: D1Database, email: string): Promise<User | null> => {
  let user = await db
    .prepare('SELECT user_email, customer_type, compute_count, enrollment_date FROM users WHERE user_email = ?')
    .bind(email)
    .first<User>();

  if (!user) {
    user = await createUser(db, email);
  }

  return user;
};

export const checkAndHandleExpiredEnrollment = async (db: D1Database, user: User, email: string): Promise<User> => {
  if (user.customer_type === 'paid' && hasEnrollmentExpired(user.enrollment_date)) {
    await db
      .prepare('UPDATE users SET customer_type = ?, compute_count = ?, enrollment_date = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?')
      .bind('free', 100, email)
      .run();

    user.customer_type = 'free';
    user.compute_count = 100;
    user.enrollment_date = null;
  }

  return user;
};