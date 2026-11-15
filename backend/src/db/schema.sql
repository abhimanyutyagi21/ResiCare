-- ResiCare schema. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('resident', 'admin', 'worker')),
  tower          TEXT,
  flat           TEXT,
  specialization TEXT,
  settings       JSONB NOT NULL DEFAULT '{"email": true, "sms": false}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

CREATE SEQUENCE IF NOT EXISTS complaint_number_seq;

CREATE TABLE IF NOT EXISTS complaints (
  id                 TEXT PRIMARY KEY,               -- e.g. RC-2026-001
  resident_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  category           TEXT NOT NULL,
  description        TEXT NOT NULL,
  tower              TEXT NOT NULL,
  floor              TEXT,
  flat               TEXT NOT NULL,
  priority           TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
  status             TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  assigned_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS complaints_resident_idx ON complaints (resident_id);
CREATE INDEX IF NOT EXISTS complaints_worker_idx   ON complaints (assigned_worker_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx   ON complaints (status);

CREATE TABLE IF NOT EXISTS complaint_attachments (
  id           SERIAL PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS attachments_complaint_idx ON complaint_attachments (complaint_id);

CREATE TABLE IF NOT EXISTS complaint_activity (
  id           SERIAL PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_complaint_idx ON complaint_activity (complaint_id);

CREATE TABLE IF NOT EXISTS feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,  -- one review per complaint
  resident_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'General',
  priority    TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Emergency')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gate_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT NOT NULL,
  contact      TEXT NOT NULL DEFAULT '',
  purpose      TEXT NOT NULL DEFAULT '',
  flat         TEXT NOT NULL,
  vehicle      TEXT NOT NULL DEFAULT '-',
  entry_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_time    TIMESTAMPTZ
);
