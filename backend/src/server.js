import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { errorHandler, notFound } from './middleware/error.js';
import announcements from './routes/announcements.js';
import auth from './routes/auth.js';
import complaints from './routes/complaints.js';
import feedback from './routes/feedback.js';
import gate from './routes/gate.js';
import users from './routes/users.js';

const app = express();
app.set('trust proxy', 1); // correct client IPs for rate limiting behind Render/Heroku/nginx

// CSP is off because the landing page pulls fonts/images/video from external hosts and uses an inline theme script.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: '100kb' }));

// Uploaded proof photos/videos (filenames are random UUIDs).
app.use('/uploads', express.static(config.uploadDir, { index: false, maxAge: '7d' }));

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});

// Brute-force protection on the credential endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please try again in a few minutes.' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/complaints', complaints);
app.use('/api/announcements', announcements);
app.use('/api/feedback', feedback);
app.use('/api/gate-entries', gate);
app.use('/api', notFound);

// Optional single-server deploy: if the React app has been built (npm run build in /frontend), serve it too.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

app.listen(config.port, () => console.log(`ResiCare API listening on http://localhost:${config.port}`));
