import './useDirectUrl.js';
import bcrypt from 'bcryptjs';
import { pool, tx } from './pool.js';

// Same demo data the original localStorage version shipped with. Only runs on an empty database.
const USERS = [
  { key: 'ananya', name: 'Ananya Verma', email: 'resident@resicare.demo', phone: '9876500001', password: 'resident123', role: 'resident', tower: 'A', flat: '304' },
  { key: 'rohit', name: 'Rohit Malhotra', email: 'rohit@resicare.demo', phone: '9876500002', password: 'resident123', role: 'resident', tower: 'B', flat: '112' },
  { key: 'priya', name: 'Priya Nair', email: 'priya@resicare.demo', phone: '9876500003', password: 'resident123', role: 'resident', tower: 'A', flat: '502' },
  { key: 'admin', name: 'Society Admin', email: 'admin@resicare.demo', phone: '9876500010', password: 'admin123', role: 'admin' },
  { key: 'rahul', name: 'Rahul Sharma', email: 'worker@resicare.demo', phone: '9876500020', password: 'worker123', role: 'worker', specialization: 'Electrician' },
  { key: 'amit', name: 'Amit Kumar', email: 'amit@resicare.demo', phone: '9876500021', password: 'worker123', role: 'worker', specialization: 'Plumber' },
  { key: 'suresh', name: 'Suresh Yadav', email: 'suresh@resicare.demo', phone: '9876500022', password: 'worker123', role: 'worker', specialization: 'Carpenter' },
];

// resident / worker are keys from USERS above.
const COMPLAINTS = [
  { resident: 'ananya', title: 'Kitchen tap leaking continuously', category: 'Plumbing', description: 'The kitchen tap has been leaking since yesterday night, water is being wasted.', priority: 'Medium', status: 'Resolved', worker: 'amit', tower: 'A', floor: '3', flat: '304' },
  { resident: 'ananya', title: 'Lift making loud grinding noise', category: 'Lift', description: 'Lift in Tower A makes a loud grinding sound between the 2nd and 4th floor.', priority: 'High', status: 'In Progress', worker: 'rahul', tower: 'A', floor: '3', flat: '304' },
  { resident: 'ananya', title: 'Power socket sparking in living room', category: 'Electrical', description: 'One of the sockets sparked while plugging in the iron box. Needs urgent attention.', priority: 'Emergency', status: 'Assigned', worker: 'rahul', tower: 'A', floor: '3', flat: '304' },
  { resident: 'rohit', title: 'Main gate lock is jammed', category: 'Security', description: 'The main gate lock near Tower B is jammed and hard to open.', priority: 'High', status: 'Pending', tower: 'B', floor: '1', flat: '112' },
  { resident: 'priya', title: 'Common area lights not working', category: 'Electrical', description: 'Corridor lights on the 5th floor of Tower A have not worked for 3 days.', priority: 'Low', status: 'Closed', worker: 'rahul', tower: 'A', floor: '5', flat: '502', feedback: { rating: 4, comment: 'Fixed quickly, thank you.' } },
  { resident: 'rohit', title: 'Wooden cupboard door detached', category: 'Carpentry', description: 'One of the wardrobe doors has come off its hinge.', priority: 'Low', status: 'Pending', tower: 'B', floor: '1', flat: '112' },
  { resident: 'priya', title: 'Parking slot markings faded', category: 'Parking', description: 'Parking lines in the basement are barely visible, causing confusion.', priority: 'Low', status: 'Pending', tower: 'A', floor: '5', flat: '502' },
  { resident: 'ananya', title: 'Water overflow near overhead tank', category: 'Plumbing', description: 'Water is overflowing from the terrace tank, wasting a lot of water.', priority: 'Emergency', status: 'In Progress', worker: 'amit', tower: 'A', floor: '3', flat: '304' },
];

const ANNOUNCEMENTS = [
  ['Water supply maintenance on Sunday', 'Water supply will be interrupted from 10 AM to 2 PM on Sunday for tank cleaning.', 'Maintenance', 'Important'],
  ['Fire safety drill next week', 'A mandatory fire safety drill will be conducted for all towers next Tuesday at 11 AM.', 'Emergency', 'Emergency'],
  ['Diwali celebration in the clubhouse', 'Join us for the annual Diwali get-together at the clubhouse this Saturday evening.', 'Events', 'Normal'],
  ['New visitor entry process', 'All visitors must now be registered at the gate with a valid ID before entry.', 'Security', 'Important'],
  ['Society AGM scheduled', 'The Annual General Meeting will be held in the community hall next month.', 'General', 'Normal'],
];

const GATE = [
  { visitor_name: 'Vikas Traders (Courier)', contact: '9812345670', purpose: 'Delivery', flat: 'A-304', vehicle: 'DL 4C 1122', exited: false },
  { visitor_name: 'Meena Joshi', contact: '9812345671', purpose: 'Guest', flat: 'B-112', vehicle: '-', exited: true },
  { visitor_name: 'Speedy Cabs', contact: '9812345672', purpose: 'Cab pickup', flat: 'A-502', vehicle: 'UP16 AB 4433', exited: true },
];

try {
  const { rows: [{ count }] } = await pool.query('SELECT count(*)::int AS count FROM users');
  if (count > 0) {
    console.log('Database already has users — skipping seed.');
  } else {
    await tx(async (db) => {
      const ids = {}, names = {};
      for (const u of USERS) {
        const { rows } = await db.query(
          `INSERT INTO users (name, email, phone, password_hash, role, tower, flat, specialization)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [u.name, u.email, u.phone, bcrypt.hashSync(u.password, 10), u.role, u.tower ?? null, u.flat ?? null, u.specialization ?? null]
        );
        ids[u.key] = rows[0].id; names[u.key] = u.name;
      }

      for (const c of COMPLAINTS) {
        const { rows: [{ n }] } = await db.query("SELECT nextval('complaint_number_seq') AS n");
        const id = `RC-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
        await db.query(
          `INSERT INTO complaints (id, resident_id, title, category, description, tower, floor, flat, priority, status, assigned_worker_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [id, ids[c.resident], c.title, c.category, c.description, c.tower, c.floor, c.flat, c.priority, c.status, c.worker ? ids[c.worker] : null]
        );
        const log = ['Complaint submitted.'];
        if (c.worker) log.push(`Assigned to ${names[c.worker]}.`);
        if (['In Progress', 'Resolved', 'Closed'].includes(c.status)) log.push('Work started.');
        if (['Resolved', 'Closed'].includes(c.status)) log.push('Marked as resolved by worker.');
        if (c.status === 'Closed') log.push('Resident confirmed resolution. Complaint closed.');
        for (const text of log) await db.query('INSERT INTO complaint_activity (complaint_id, text) VALUES ($1,$2)', [id, text]);
        if (c.feedback) {
          await db.query('INSERT INTO feedback (complaint_id, resident_id, rating, comment) VALUES ($1,$2,$3,$4)', [id, ids[c.resident], c.feedback.rating, c.feedback.comment]);
        }
      }

      for (const [title, description, category, priority] of ANNOUNCEMENTS) {
        await db.query('INSERT INTO announcements (title, description, category, priority) VALUES ($1,$2,$3,$4)', [title, description, category, priority]);
      }
      for (const g of GATE) {
        await db.query(
          `INSERT INTO gate_entries (visitor_name, contact, purpose, flat, vehicle, exit_time) VALUES ($1,$2,$3,$4,$5, ${g.exited ? 'now()' : 'NULL'})`,
          [g.visitor_name, g.contact, g.purpose, g.flat, g.vehicle]
        );
      }
    });
    console.log('✓ Seeded demo users, complaints, announcements and gate entries.');
    console.log('  resident@resicare.demo / resident123');
    console.log('  admin@resicare.demo    / admin123');
    console.log('  worker@resicare.demo   / worker123');
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
