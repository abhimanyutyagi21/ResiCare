import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
router.use(requireAuth);

// Used by the admin's "Assign Worker" dialog.
router.get('/workers', requireRole('admin'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query("SELECT id, name, specialization FROM users WHERE role = 'worker' ORDER BY name");
  res.json(rows);
}));

export default router;
