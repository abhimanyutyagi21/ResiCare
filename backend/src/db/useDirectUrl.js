// Import this FIRST in migrate/seed: ES imports run in order, so the override lands before config.js reads the env.
import 'dotenv/config';
if (process.env.DATABASE_URL_DIRECT) process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT;
