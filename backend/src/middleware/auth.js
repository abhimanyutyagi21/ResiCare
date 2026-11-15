import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { HttpError, asyncHandler } from '../utils/http.js';

export const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// Verifies the Bearer token and loads the user from the DB, so deleted/changed accounts take effect immediately.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please log in to continue.');

  let payload;
  try { payload = jwt.verify(token, config.jwtSecret); }
  catch { throw new HttpError(401, 'Your session has expired. Please log in again.'); }

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw new HttpError(401, 'Your session has expired. Please log in again.');
  req.user = rows[0];
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new HttpError(403, "You don't have permission to do that."));
  next();
};
