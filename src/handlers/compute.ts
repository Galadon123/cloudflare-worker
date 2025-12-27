import { Hono } from 'hono';
import type { Env, ComputeRequest, UpdateComputeRequest, ComputeResponse } from '../types';
import { isValidEmail } from '../utils/validation';
import { errorResponse, successResponse } from '../utils/responses';
import { getOrCreateUser, checkAndHandleExpiredEnrollment } from '../services/userService';

const compute = new Hono<{ Bindings: Env }>();

compute.get('/:email', async (c) => {
  const email = c.req.param('email');

  if (!email || !isValidEmail(email)) {
    return errorResponse(c, 'Invalid email', 'Please provide a valid email address', 400);
  }

  try {
    const db = c.env.DB;
    let user = await getOrCreateUser(db, email);

    if (!user) {
      return errorResponse(c, 'User creation failed', 'Failed to create user in database', 500);
    }

    user = await checkAndHandleExpiredEnrollment(db, user, email);

    return successResponse(c, {
      email: user.user_email,
      compute_count: user.compute_count,
      customer_type: user.customer_type,
      enrollment_date: user.enrollment_date,
    } as ComputeResponse);
  } catch (error) {
    console.error('Error fetching compute count:', error);
    return errorResponse(c, 'Internal server error', 'Failed to fetch compute count');
  }
});

compute.post('/', async (c) => {
  try {
    const body = await c.req.json<ComputeRequest>();
    const email = body.email;

    if (!email || !isValidEmail(email)) {
      return errorResponse(c, 'Invalid email', 'Please provide a valid email address', 400);
    }

    const db = c.env.DB;
    let user = await getOrCreateUser(db, email);

    if (!user) {
      return errorResponse(c, 'User creation failed', 'Failed to create user', 500);
    }

    user = await checkAndHandleExpiredEnrollment(db, user, email);

    if (user.compute_count <= 0) {
      return errorResponse(c, 'Limit exceeded', "You don't have enough poridhi-compute", 403);
    }

    const newComputeCount = user.compute_count - 1;
    await db
      .prepare('UPDATE users SET compute_count = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?')
      .bind(newComputeCount, email)
      .run();

    return successResponse(c, {
      email: user.user_email,
      compute_count: newComputeCount,
      customer_type: user.customer_type,
      enrollment_date: user.enrollment_date,
    } as ComputeResponse);
  } catch (error) {
    console.error('Error incrementing compute count:', error);
    return errorResponse(c, 'Internal server error', 'Failed to increment compute count');
  }
});

compute.put('/', async (c) => {
  try {
    const body = await c.req.json<UpdateComputeRequest>();
    const { email, compute_count, customer_type } = body;

    if (!email || !isValidEmail(email)) {
      return errorResponse(c, 'Invalid email', 'Please provide a valid email address', 400);
    }

    if (compute_count === undefined || compute_count < 0) {
      return errorResponse(c, 'Invalid compute count', 'compute_count must be a non-negative number', 400);
    }

    if (customer_type && !['free', 'paid'].includes(customer_type)) {
      return errorResponse(c, 'Invalid customer type', 'customer_type must be either "free" or "paid"', 400);
    }

    if (customer_type === 'free' && compute_count > 100) {
      return errorResponse(c, 'Invalid compute count', 'Free customers cannot have more than 100 compute count', 400);
    }

    if (customer_type === 'paid' && compute_count > 10000) {
      return errorResponse(c, 'Invalid compute count', 'Paid customers cannot have more than 10000 compute count', 400);
    }

    const db = c.env.DB;
    const user = await db
      .prepare('SELECT id, user_email, customer_type, compute_count, enrollment_date FROM users WHERE user_email = ?')
      .bind(email)
      .first();

    if (!user) {
      return errorResponse(c, 'User not found', 'No user found with this email address', 404);
    }

    const newCustomerType = customer_type || user.customer_type;
    let enrollmentDate = user.enrollment_date;

    if (user.customer_type === 'free' && newCustomerType === 'paid') {
      enrollmentDate = new Date().toISOString();
    }

    if (user.customer_type === 'paid' && newCustomerType === 'free') {
      enrollmentDate = null;
    }

    await db
      .prepare('UPDATE users SET compute_count = ?, customer_type = ?, enrollment_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?')
      .bind(compute_count, newCustomerType, enrollmentDate, email)
      .run();

    return successResponse(c, {
      email: email,
      compute_count: compute_count,
      customer_type: newCustomerType,
      enrollment_date: enrollmentDate,
    } as ComputeResponse);
  } catch (error) {
    console.error('Error updating compute count:', error);
    return errorResponse(c, 'Internal server error', 'Failed to update compute count');
  }
});

compute.delete('/:email', async (c) => {
  try {
    const email = c.req.param('email');

    if (!email || !isValidEmail(email)) {
      return errorResponse(c, 'Invalid email', 'Please provide a valid email address', 400);
    }

    const db = c.env.DB;
    const user = await db
      .prepare('SELECT id, user_email FROM users WHERE user_email = ?')
      .bind(email)
      .first();

    if (!user) {
      return errorResponse(c, 'User not found', 'No user found with this email address', 404);
    }

    await db
      .prepare('DELETE FROM users WHERE user_email = ?')
      .bind(email)
      .run();

    return successResponse(c, {
      success: true,
      message: `User ${email} has been deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse(c, 'Internal server error', 'Failed to delete user');
  }
});

export default compute;