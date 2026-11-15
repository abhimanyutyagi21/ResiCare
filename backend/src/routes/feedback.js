import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';
import { feedbackToJson } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth, requireRole('resident', 'admin'));

// Residents see their own feedback; admins see everyone's.
router.get('/', asyncHandler(async (req, res) => {
  const own = req.user.role === 'resident';
  const { rows } = await pool.query(
    `SELECT f.*, c.title AS complaint_title, u.name AS resident_name
     FROM feedback f
     JOIN complaints c ON c.id = f.complaint_id
     JOIN users u ON u.id = f.resident_id
     ${own ? 'WHERE f.resident_id = $1' : ''}
     ORDER BY f.created_at DESC`,
    own ? [req.user.id] : []
  );
  res.json(rows.map(feedbackToJson));
}));

export default router;
