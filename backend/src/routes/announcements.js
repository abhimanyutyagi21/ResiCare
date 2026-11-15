import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { announcementToJson } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  title: z.string().trim().min(1, 'Please enter a title.').max(150),
  description: z.string().trim().min(1, 'Please enter a description.').max(2000),
  category: z.enum(['General', 'Maintenance', 'Emergency', 'Security', 'Events']),
  priority: z.enum(['Normal', 'Important', 'Emergency']),
});

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json(rows.map(announcementToJson));
}));

router.post('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const d = schema.parse(req.body);
  const { rows } = await pool.query(
    'INSERT INTO announcements (title, description, category, priority) VALUES ($1,$2,$3,$4) RETURNING *',
    [d.title, d.description, d.category, d.priority]
  );
  res.status(201).json(announcementToJson(rows[0]));
}));

router.patch('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const d = schema.parse(req.body);
  const { rows } = await pool.query(
    'UPDATE announcements SET title=$2, description=$3, category=$4, priority=$5 WHERE id=$1 RETURNING *',
    [req.params.id, d.title, d.description, d.category, d.priority]
  );
  if (!rows[0]) throw new HttpError(404, 'Announcement not found.');
  res.json(announcementToJson(rows[0]));
}));

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'Announcement not found.');
  res.status(204).end();
}));

export default router;
