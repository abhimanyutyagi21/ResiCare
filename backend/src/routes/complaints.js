import { Router } from 'express';
import { z } from 'zod';
import { CATEGORIES, PRIORITIES, STATUSES } from '../config.js';
import { pool, tx } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { deleteUploaded, upload } from '../middleware/upload.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { complaintToJson } from '../utils/serialize.js';

const router = Router();
router.use(requireAuth);

const BASE_SELECT = `
  SELECT c.*, r.name AS resident_name, w.name AS assigned_worker_name
  FROM complaints c
  JOIN users r ON r.id = c.resident_id
  LEFT JOIN users w ON w.id = c.assigned_worker_id`;

// Who may see which complaints: residents their own, workers the ones assigned to them, admins everything.
function scope(user, paramIndex) {
  if (user.role === 'resident') return { sql: `c.resident_id = $${paramIndex}`, params: [user.id] };
  if (user.role === 'worker') return { sql: `c.assigned_worker_id = $${paramIndex}`, params: [user.id] };
  return { sql: 'TRUE', params: [] };
}

async function loadComplaint(id, user) {
  const s = scope(user, 2);
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1 AND ${s.sql}`, [id, ...s.params]);
  if (!rows[0]) return null;
  const [attachments, activity, feedback] = await Promise.all([
    pool.query('SELECT type, url FROM complaint_attachments WHERE complaint_id = $1 ORDER BY id', [id]),
    pool.query('SELECT text, created_at FROM complaint_activity WHERE complaint_id = $1 ORDER BY id', [id]),
    pool.query('SELECT rating, comment, created_at FROM feedback WHERE complaint_id = $1', [id]),
  ]);
  return {
    ...complaintToJson(rows[0]),
    attachments: attachments.rows,
    activity: activity.rows.map((a) => ({ date: a.created_at, text: a.text })),
    feedback: feedback.rows[0] ? { rating: feedback.rows[0].rating, comment: feedback.rows[0].comment, date: feedback.rows[0].created_at } : null,
  };
}

// 404 (not 403) for complaints you can't see, so ids can't be probed.
async function mustFind(id, user) {
  const c = await loadComplaint(id, user);
  if (!c) throw new HttpError(404, 'Complaint not found.');
  return c;
}

// Update columns + append an activity line in one transaction. Column names are fixed by the callers below.
async function applyUpdate(id, fields, activityText) {
  await tx(async (db) => {
    const keys = Object.keys(fields);
    const sets = [...keys.map((k, i) => `${k} = $${i + 2}`), 'updated_at = now()'];
    await db.query(`UPDATE complaints SET ${sets.join(', ')} WHERE id = $1`, [id, ...keys.map((k) => fields[k])]);
    if (activityText) await db.query('INSERT INTO complaint_activity (complaint_id, text) VALUES ($1, $2)', [id, activityText]);
  });
}

/* ───────────── Read ───────────── */
router.get('/', asyncHandler(async (req, res) => {
  const s = scope(req.user, 1);
  const { rows } = await pool.query(`${BASE_SELECT} WHERE ${s.sql} ORDER BY c.created_at DESC`, s.params);
  res.json(rows.map(complaintToJson));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await mustFind(req.params.id, req.user));
}));

/* ───────────── Create (resident) ───────────── */
const createSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a title for the issue.').max(150),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  description: z.string().trim().min(1, 'Please enter a description.').max(2000),
  tower: z.string().trim().min(1, 'Please enter tower and flat.').max(20),
  floor: z.string().trim().max(20).optional().default(''),
  flat: z.string().trim().min(1, 'Please enter tower and flat.').max(20),
});

router.post('/', requireRole('resident'), upload.array('attachments', 6), asyncHandler(async (req, res) => {
  const files = req.files || [];
  try {
    const d = createSchema.parse(req.body);
    if (!files.length) throw new HttpError(400, 'Please attach at least one photo or video as proof.');

    const id = await tx(async (db) => {
      const { rows: [{ n }] } = await db.query("SELECT nextval('complaint_number_seq') AS n");
      const newId = `RC-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
      await db.query(
        `INSERT INTO complaints (id, resident_id, title, category, description, tower, floor, flat, priority)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [newId, req.user.id, d.title, d.category, d.description, d.tower, d.floor, d.flat, d.priority]
      );
      for (const f of files) {
        await db.query('INSERT INTO complaint_attachments (complaint_id, type, url) VALUES ($1,$2,$3)',
          [newId, f.mimetype.startsWith('video/') ? 'video' : 'image', `/uploads/${f.filename}`]);
      }
      await db.query('INSERT INTO complaint_activity (complaint_id, text) VALUES ($1, $2)', [newId, 'Complaint submitted.']);
      return newId;
    });
    res.status(201).json(await mustFind(id, req.user));
  } catch (err) {
    deleteUploaded(files); // don't leave orphaned files behind when validation/DB fails
    throw err;
  }
}));

/* ───────────── Admin actions ───────────── */
router.patch('/:id/assign', requireRole('admin'), asyncHandler(async (req, res) => {
  const { workerId } = z.object({ workerId: z.string().uuid() }).parse(req.body);
  await mustFind(req.params.id, req.user);
  const { rows } = await pool.query("SELECT id, name FROM users WHERE id = $1 AND role = 'worker'", [workerId]);
  if (!rows[0]) throw new HttpError(400, 'That worker does not exist.');
  await applyUpdate(req.params.id, { status: 'Assigned', assigned_worker_id: rows[0].id }, `Assigned to ${rows[0].name}.`);
  res.json(await mustFind(req.params.id, req.user));
}));

router.patch('/:id/priority', requireRole('admin'), asyncHandler(async (req, res) => {
  const { priority } = z.object({ priority: z.enum(PRIORITIES) }).parse(req.body);
  await mustFind(req.params.id, req.user);
  await applyUpdate(req.params.id, { priority }, `Priority changed to ${priority}.`);
  res.json(await mustFind(req.params.id, req.user));
}));

router.patch('/:id/status', requireRole('admin'), asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);
  await mustFind(req.params.id, req.user);
  await applyUpdate(req.params.id, { status }, `Status updated to ${status} by admin.`);
  res.json(await mustFind(req.params.id, req.user));
}));

/* ───────────── Worker / resident workflow steps ───────────── */
// Each step only works from the right status, so the Pending → … → Closed flow can't be skipped.
function step({ role, from, to, activity, message }) {
  return [requireRole(role), asyncHandler(async (req, res) => {
    const c = await mustFind(req.params.id, req.user); // scope() already limits workers/residents to their own complaints
    if (c.status !== from) throw new HttpError(409, message);
    await applyUpdate(c.id, { status: to }, activity);
    res.json(await mustFind(c.id, req.user));
  })];
}
router.post('/:id/start', ...step({ role: 'worker', from: 'Assigned', to: 'In Progress', activity: 'Work started.', message: 'Only assigned complaints can be started.' }));
router.post('/:id/resolve', ...step({ role: 'worker', from: 'In Progress', to: 'Resolved', activity: 'Marked as resolved by worker.', message: 'Only complaints in progress can be resolved.' }));
router.post('/:id/confirm', ...step({ role: 'resident', from: 'Resolved', to: 'Closed', activity: 'Resident confirmed resolution. Complaint closed.', message: 'Only resolved complaints can be confirmed.' }));

/* ───────────── Feedback (resident) ───────────── */
router.post('/:id/feedback', requireRole('resident'), asyncHandler(async (req, res) => {
  const d = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).default('') }).parse(req.body);
  const c = await mustFind(req.params.id, req.user);
  if (c.status !== 'Closed') throw new HttpError(409, 'You can leave feedback once the complaint is closed.');
  if (c.feedback) throw new HttpError(409, "You've already submitted feedback for this complaint.");
  await tx(async (db) => {
    await db.query('INSERT INTO feedback (complaint_id, resident_id, rating, comment) VALUES ($1,$2,$3,$4)', [c.id, req.user.id, d.rating, d.comment]);
    await db.query('UPDATE complaints SET updated_at = now() WHERE id = $1', [c.id]);
  });
  res.status(201).json(await mustFind(c.id, req.user));
}));

export default router;
