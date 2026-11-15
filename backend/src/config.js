import path from 'node:path';

const env = process.env;
const isProd = env.NODE_ENV === 'production';

if (isProd && (!env.JWT_SECRET || env.JWT_SECRET.startsWith('change-me'))) {
  throw new Error('JWT_SECRET must be set to a long random string in production.');
}

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and paste your Neon connection string.');
}

export const config = {
  isProd,
  port: Number(env.PORT) || 5000,
  databaseUrl: env.DATABASE_URL || '',
  // Neon (and most hosted Postgres) requires SSL. Auto-on for non-local URLs; override with DATABASE_SSL=false.
  databaseSsl: env.DATABASE_SSL ? env.DATABASE_SSL === 'true' : !/localhost|127\.0\.0\.1/.test(env.DATABASE_URL || ''),
  jwtSecret: env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  clientOrigins: (env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  adminInviteCode: env.ADMIN_INVITE_CODE || '',
  uploadDir: path.resolve(env.UPLOAD_DIR || './uploads'),
};

export const CATEGORIES = ['Plumbing', 'Electrical', 'Lift', 'Carpentry', 'Cleaning', 'Security', 'Parking', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];
export const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
export const ROLES = ['resident', 'admin', 'worker'];
