// Database rows (snake_case) → JSON the React app expects (camelCase). Never leaks password hashes.
export const userToJson = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  tower: u.tower,
  flat: u.flat,
  specialization: u.specialization,
  settings: u.settings,
  createdAt: u.created_at,
});

export const complaintToJson = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  description: r.description,
  tower: r.tower,
  floor: r.floor,
  flat: r.flat,
  priority: r.priority,
  status: r.status,
  residentId: r.resident_id,
  residentName: r.resident_name,
  assignedWorkerId: r.assigned_worker_id,
  assignedWorkerName: r.assigned_worker_name,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const announcementToJson = (a) => ({
  id: a.id,
  title: a.title,
  description: a.description,
  category: a.category,
  priority: a.priority,
  createdAt: a.created_at,
});

export const feedbackToJson = (f) => ({
  id: f.id,
  complaintId: f.complaint_id,
  complaintTitle: f.complaint_title,
  residentId: f.resident_id,
  residentName: f.resident_name,
  rating: f.rating,
  comment: f.comment,
  date: f.created_at,
});

export const gateEntryToJson = (g) => ({
  id: g.id,
  visitorName: g.visitor_name,
  contact: g.contact,
  purpose: g.purpose,
  flat: g.flat,
  vehicle: g.vehicle,
  entryTime: g.entry_time,
  exitTime: g.exit_time,
});
