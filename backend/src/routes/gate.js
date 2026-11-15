import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { gateEntryToJson } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

const schema = z.object({
  visitorName: z.string().trim().min(1, 'Please enter the visitor name.').max(100),
  flat: z.string().trim().min(1, 'Please enter the flat.').max(30),
  contact: z.string().trim().max(30).default(''),
  purpose: z.string().trim().max(100).default(''),
  vehicle: z.string().trim().max(30).default('-'),
});

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gate_entries ORDER BY entry_time DESC LIMIT 500');
  res.json(rows.map(gateEntryToJson));
}));

router.post('/', asyncHandler(async (req, res) => {
  const d = schema.parse(req.body);
  const { rows } = await pool.query(
    'INSERT INTO gate_entries (visitor_name, flat, contact, purpose, vehicle) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [d.visitorName, d.flat, d.contact, d.purpose, d.vehicle || '-']
  );
  res.status(201).json(gateEntryToJson(rows[0]));
}));

router.post('/:id/exit', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('UPDATE gate_entries SET exit_time = now() WHERE id = $1 AND exit_time IS NULL RETURNING *', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Entry not found or already exited.');
  res.json(gateEntryToJson(rows[0]));
}));

export default router;
