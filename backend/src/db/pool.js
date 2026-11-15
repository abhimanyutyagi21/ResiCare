import pg from 'pg';
import { config } from '../config.js';

// Neon-friendly pool: small, drops idle clients quickly (Neon suspends idle compute),
// and waits long enough for a suspended database to wake up on the first request.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: true } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

// Without this, a connection dropped by Neon while idle would crash the process.
pool.on('error', (err) => console.error('Idle database client error:', err.message));

// Run several queries atomically: tx(async (db) => { await db.query(...); ... })
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
