import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http.js';

export function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) fields[issue.path.join('.') || 'form'] ??= issue.message;
    return res.status(400).json({ error: err.issues[0].message, fields });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each file must be under 25 MB.' : err.code === 'LIMIT_FILE_COUNT' ? 'You can attach up to 6 files.' : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, fields: err.fields });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  if (err.code === '22P02') return res.status(400).json({ error: 'Invalid id.' }); // bad UUID in a path/body

  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}
