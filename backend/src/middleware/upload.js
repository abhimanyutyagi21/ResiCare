import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../utils/http.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

// Extension comes from an allowlist keyed by MIME type, never from the user's filename.
const EXT = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
};

export const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    cb(new HttpError(400, 'Only JPG, PNG, WebP, GIF, MP4, WebM or MOV files are allowed.'));
  },
});

export function deleteUploaded(files = []) {
  for (const f of files) fs.unlink(f.path, () => {});
}
