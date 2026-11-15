# ResiCare — React + Express

The original ResiCare site (plain HTML/JS + localStorage) converted to a React frontend with a real backend.

```
frontend/   React 18 + Vite + React Router   (port 5173)
backend/    Express + Neon PostgreSQL + JWT        (port 5000)
```

## Run it (Neon)

1. Create a free project at https://neon.tech and copy the connection string (Connect → pick the **pooled** one).
2. Backend:
```bash
cd backend
cp .env.example .env          # paste DATABASE_URL, set JWT_SECRET
npm install
npm run db:setup              # creates tables + demo data in Neon
npm run dev
```
3. Frontend (new terminal):
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxies /api and /uploads to :5000)
```

Tip: in Neon, create a separate branch (e.g. `dev`) for local work so you never touch production data.

Demo logins (seeded): `resident@resicare.demo / resident123`, `admin@resicare.demo / admin123`, `worker@resicare.demo / worker123`.

## What changed from the original

| Original | Now |
|---|---|
| `Store` in localStorage | REST API + Neon PostgreSQL (`src/api/client.js` on the frontend) |
| Plaintext passwords | bcrypt hashes, JWT sessions ("Remember me" really works) |
| Anyone could sign up as admin | Admin sign-up needs `ADMIN_INVITE_CODE` |
| Role checks only in the UI | Enforced on the server (residents see only their complaints, workers only theirs) |
| Status changes anywhere | Server enforces Assigned → In Progress → Resolved → Closed |
| Photos as base64 in localStorage | Multipart upload to `/uploads` (resized in the browser first) |
| 69 MB of images | Resized to ~3 MB (`public/images`) |
| `app.js` string templates + DOM events | Components, hooks, context, routes |

## API

All routes are under `/api`; send `Authorization: Bearer <token>`.

| Method | Path | Who |
|---|---|---|
| POST | `/auth/signup`, `/auth/login` | public |
| GET / PATCH | `/auth/me` | any |
| GET | `/users/workers` | admin |
| GET | `/complaints`, `/complaints/:id` | role-scoped |
| POST | `/complaints` (multipart, field `attachments`) | resident |
| PATCH | `/complaints/:id/assign`, `/priority`, `/status` | admin |
| POST | `/complaints/:id/start`, `/resolve` | worker |
| POST | `/complaints/:id/confirm`, `/feedback` | resident |
| GET / POST / PATCH / DELETE | `/announcements` | read: any, write: admin |
| GET | `/feedback` | resident (own), admin (all) |
| GET / POST, POST `/:id/exit` | `/gate-entries` | admin |

## Deploying

- Simplest: `cd frontend && npm run build`, then run the backend — it serves `frontend/dist` automatically (one service, no CORS).
- Separate hosts: set `VITE_API_URL` / `VITE_ASSET_URL` for the frontend and `CLIENT_ORIGIN` for the backend.
- Neon needs no extra setup: SSL is automatic. Cold starts after idle can add ~1s to the first request.
- **Uploads:** Neon stores data only, not files, and many hosts have ephemeral disks. Mount a persistent disk at `UPLOAD_DIR`, or swap `middleware/upload.js` for S3/Cloudinary.
