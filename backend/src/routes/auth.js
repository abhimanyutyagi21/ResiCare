import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { config, ROLES } from '../config.js';
import { pool } from '../db/pool.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { userToJson } from '../utils/serialize.js';

const router = Router();

const SPECIALIZATIONS = ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Lift Technician'];

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your full name.').max(100),
  email: z.string().trim().email('Please enter a valid email.').max(200),
  phone: z.string().trim().regex(/^\d{7,15}$/, 'Please enter a valid phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(200),
  role: z.enum(ROLES),
  tower: z.string().trim().max(20).optional(),
  flat: z.string().trim().max(20).optional(),
  specialization: z.enum(SPECIALIZATIONS).optional(),
  inviteCode: z.string().trim().optional(),
});

const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

router.post('/signup', asyncHandler(async (req, res) => {
  const d = signupSchema.parse(req.body);

  // Anyone can pick "admin" in the UI, so the server must gate it.
  if (d.role === 'admin') {
    if (!config.adminInviteCode) throw new HttpError(403, 'Admin sign-up is disabled.', { inviteCode: 'Admin sign-up is disabled.' });
    if (!d.inviteCode || !safeEqual(d.inviteCode, config.adminInviteCode)) throw new HttpError(403, 'Invalid admin invite code.', { inviteCode: 'Invalid admin invite code.' });
  }

  const hash = await bcrypt.hash(d.password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, tower, flat, specialization)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [d.name, d.email, d.phone, hash, d.role,
        d.role === 'resident' ? d.tower || null : null,
        d.role === 'resident' ? d.flat || null : null,
        d.role === 'worker' ? d.specialization || null : null]
    );
    res.status(201).json({ user: userToJson(rows[0]) });
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'An account with this email already exists.', { email: 'An account with this email already exists.' });
    throw err;
  }
}));

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Please enter your email and password.'),
  password: z.string().min(1, 'Please enter your email and password.'),
  role: z.enum(ROLES),
});

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, role } = loginSchema.parse(req.body);
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  const user = rows[0];
  // Same message for unknown email and wrong password so accounts can't be probed.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, 'Incorrect email or password.');
  if (user.role !== role) throw new HttpError(403, `This account is registered as ${user.role}, not ${role}.`);
  res.json({ token: signToken(user), user: userToJson(user) });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: userToJson(req.user) }));

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^\d{7,15}$/, 'Please enter a valid phone number.'),
  tower: z.string().trim().max(20),
  flat: z.string().trim().max(20),
  specialization: z.enum(SPECIALIZATIONS),
  settings: z.object({ email: z.boolean(), sms: z.boolean() }),
}).partial();

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const d = profileSchema.parse(req.body);
  const role = req.user.role;

  // Whitelist what each role may change; column names below are fixed strings, never user input.
  const updates = {};
  if (d.name !== undefined) updates.name = d.name;
  if (d.phone !== undefined) updates.phone = d.phone;
  if (d.settings !== undefined) updates.settings = JSON.stringify(d.settings);
  if (role === 'resident') {
    if (d.tower !== undefined) updates.tower = d.tower;
    if (d.flat !== undefined) updates.flat = d.flat;
  }
  if (role === 'worker' && d.specialization !== undefined) updates.specialization = d.specialization;

  const keys = Object.keys(updates);
  if (!keys.length) return res.json({ user: userToJson(req.user) });

  const { rows } = await pool.query(
    `UPDATE users SET ${keys.map((k, i) => `${k} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *`,
    [req.user.id, ...keys.map((k) => updates[k])]
  );
  res.json({ user: userToJson(rows[0]) });
}));

export default router;
