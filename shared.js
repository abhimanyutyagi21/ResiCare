const KEYS = {      /* UTILITIES */
  users: 'resicare_users',
  session: 'resicare_session',
  complaints: 'resicare_complaints',
  announcements: 'resicare_announcements',
  feedback: 'resicare_feedback',
  gate: 'resicare_gate_entries',
  settings: 'resicare_settings',
};
function getStored(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function setStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota errors ignored */ }
}
function uid(prefix) { return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function nowISO() { return new Date().toISOString(); }
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}
function nextComplaintId(complaints) {
  const year = new Date().getFullYear();
  const n = complaints.length + 1;
  return `RC-${year}-${String(n).padStart(3, '0')}`;
}
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function resizeImage(file, maxW = 640) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* DEMO DATA INIT */
function initDemoData() {
  let users = getStored(KEYS.users, null);
  if (!users) {
    users = [
      { id: 'u-res-1', name: 'Ananya Verma', email: 'resident@resicare.demo', phone: '9876500001', password: 'resident123', role: 'resident', tower: 'A', flat: '304', createdAt: nowISO() },
      { id: 'u-res-2', name: 'Rohit Malhotra', email: 'rohit@resicare.demo', phone: '9876500002', password: 'resident123', role: 'resident', tower: 'B', flat: '112', createdAt: nowISO() },
      { id: 'u-res-3', name: 'Priya Nair', email: 'priya@resicare.demo', phone: '9876500003', password: 'resident123', role: 'resident', tower: 'A', flat: '502', createdAt: nowISO() },
      { id: 'u-adm-1', name: 'Society Admin', email: 'admin@resicare.demo', phone: '9876500010', password: 'admin123', role: 'admin', createdAt: nowISO() },
      { id: 'u-wrk-1', name: 'Rahul Sharma', email: 'worker@resicare.demo', phone: '9876500020', password: 'worker123', role: 'worker', specialization: 'Electrician', createdAt: nowISO() },
      { id: 'u-wrk-2', name: 'Amit Kumar', email: 'amit@resicare.demo', phone: '9876500021', password: 'worker123', role: 'worker', specialization: 'Plumber', createdAt: nowISO() },
      { id: 'u-wrk-3', name: 'Suresh Yadav', email: 'suresh@resicare.demo', phone: '9876500022', password: 'worker123', role: 'worker', specialization: 'Carpenter', createdAt: nowISO() },
    ];
    setStored(KEYS.users, users);
  }

  let complaints = getStored(KEYS.complaints, null);
  if (!complaints) {
    const mk = (over) => ({
      id: '', residentId: 'u-res-1', residentName: 'Ananya Verma', title: '', category: 'Plumbing',
      description: '', tower: 'A', floor: '3', flat: '304', priority: 'Medium', image: null,
      status: 'Pending', assignedWorkerId: null, assignedWorkerName: null,
      createdAt: nowISO(), updatedAt: nowISO(), activity: [], feedback: null, ...over,
    });
    const base = [
      mk({ title: 'Kitchen tap leaking continuously', category: 'Plumbing', description: 'The kitchen tap has been leaking since yesterday night, water is being wasted.', priority: 'Medium', status: 'Resolved', assignedWorkerId: 'u-wrk-2', assignedWorkerName: 'Amit Kumar' }),
      mk({ title: 'Lift making loud grinding noise', category: 'Lift', description: 'Lift in Tower A makes a loud grinding sound between the 2nd and 4th floor.', priority: 'High', status: 'In Progress', tower: 'A', flat: '304', assignedWorkerId: 'u-wrk-1', assignedWorkerName: 'Rahul Sharma' }),
      mk({ title: 'Power socket sparking in living room', category: 'Electrical', description: 'One of the sockets sparked while plugging in the iron box. Needs urgent attention.', priority: 'Emergency', status: 'Assigned', assignedWorkerId: 'u-wrk-1', assignedWorkerName: 'Rahul Sharma' }),
      mk({ title: 'Main gate lock is jammed', category: 'Security', description: 'The main gate lock near Tower B is jammed and hard to open.', priority: 'High', status: 'Pending', residentId: 'u-res-2', residentName: 'Rohit Malhotra', tower: 'B', floor: '1', flat: '112' }),
      mk({ title: 'Common area lights not working', category: 'Electrical', description: 'Corridor lights on the 5th floor of Tower A have not worked for 3 days.', priority: 'Low', status: 'Closed', residentId: 'u-res-3', residentName: 'Priya Nair', tower: 'A', floor: '5', flat: '502', assignedWorkerId: 'u-wrk-1', assignedWorkerName: 'Rahul Sharma', feedback: { rating: 4, comment: 'Fixed quickly, thank you.' } }),
      mk({ title: 'Wooden cupboard door detached', category: 'Carpentry', description: 'One of the wardrobe doors has come off its hinge.', priority: 'Low', status: 'Pending', residentId: 'u-res-2', residentName: 'Rohit Malhotra', tower: 'B', floor: '1', flat: '112' }),
      mk({ title: 'Parking slot markings faded', category: 'Parking', description: 'Parking lines in the basement are barely visible, causing confusion.', priority: 'Low', status: 'Pending', residentId: 'u-res-3', residentName: 'Priya Nair', tower: 'A', floor: '5', flat: '502' }),
      mk({ title: 'Water overflow near overhead tank', category: 'Plumbing', description: 'Water is overflowing from the terrace tank, wasting a lot of water.', priority: 'Emergency', status: 'In Progress', assignedWorkerId: 'u-wrk-2', assignedWorkerName: 'Amit Kumar' }),
    ];
    base.forEach((c, i) => {
      c.id = `RC-2026-${String(i + 1).padStart(3, '0')}`;
      c.activity = [{ date: c.createdAt, text: 'Complaint submitted.' }];
      if (c.assignedWorkerId) c.activity.push({ date: c.createdAt, text: `Assigned to ${c.assignedWorkerName}.` });
      if (c.status === 'In Progress' || c.status === 'Resolved' || c.status === 'Closed') c.activity.push({ date: c.createdAt, text: 'Work started.' });
      if (c.status === 'Resolved' || c.status === 'Closed') c.activity.push({ date: c.createdAt, text: 'Marked as resolved by worker.' });
      if (c.status === 'Closed') c.activity.push({ date: c.createdAt, text: 'Resident confirmed resolution. Complaint closed.' });
    });
    setStored(KEYS.complaints, base);
  }

  let announcements = getStored(KEYS.announcements, null);
  if (!announcements) {
    announcements = [
      { id: uid('an'), title: 'Water supply maintenance on Sunday', description: 'Water supply will be interrupted from 10 AM to 2 PM on Sunday for tank cleaning.', category: 'Maintenance', priority: 'Important', createdAt: nowISO() },
      { id: uid('an'), title: 'Fire safety drill next week', description: 'A mandatory fire safety drill will be conducted for all towers next Tuesday at 11 AM.', category: 'Emergency', priority: 'Emergency', createdAt: nowISO() },
      { id: uid('an'), title: 'Diwali celebration in the clubhouse', description: 'Join us for the annual Diwali get-together at the clubhouse this Saturday evening.', category: 'Events', priority: 'Normal', createdAt: nowISO() },
      { id: uid('an'), title: 'New visitor entry process', description: 'All visitors must now be registered at the gate with a valid ID before entry.', category: 'Security', priority: 'Important', createdAt: nowISO() },
      { id: uid('an'), title: 'Society AGM scheduled', description: 'The Annual General Meeting will be held in the community hall next month.', category: 'General', priority: 'Normal', createdAt: nowISO() },
    ];
    setStored(KEYS.announcements, announcements);
  }

  if (!getStored(KEYS.feedback, null)) setStored(KEYS.feedback, []);

  let gate = getStored(KEYS.gate, null);
  if (!gate) {
    gate = [
      { id: uid('ge'), visitorName: 'Vikas Traders (Courier)', contact: '9812345670', purpose: 'Delivery', flat: 'A-304', vehicle: 'DL 4C 1122', entryTime: nowISO(), exitTime: null },
      { id: uid('ge'), visitorName: 'Meena Joshi', contact: '9812345671', purpose: 'Guest', flat: 'B-112', vehicle: '-', entryTime: nowISO(), exitTime: nowISO() },
      { id: uid('ge'), visitorName: 'Speedy Cabs', contact: '9812345672', purpose: 'Cab pickup', flat: 'A-502', vehicle: 'UP16 AB 4433', entryTime: nowISO(), exitTime: nowISO() },
    ];
    setStored(KEYS.gate, gate);
  }
}

/* STORE */
initDemoData(); // must run before Store reads localStorage below

const Store = {
  session: getStored(KEYS.session, null),
  users: getStored(KEYS.users, []),
  complaints: getStored(KEYS.complaints, []),
  announcements: getStored(KEYS.announcements, []),
  feedbacks: getStored(KEYS.feedback, []),
  gateEntries: getStored(KEYS.gate, []),

  workers() { return this.users.filter((u) => u.role === 'worker'); },

  signup(data) {
    if (this.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const user = { id: uid('u'), createdAt: nowISO(), ...data };
    this.users.push(user);
    setStored(KEYS.users, this.users);
    return { ok: true };
  },
  login(email, password, role) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) return { ok: false, error: 'Incorrect email or password.' };
    if (user.role !== role) return { ok: false, error: `This account is registered as ${user.role}, not ${role}.` };
    this.session = { userId: user.id, name: user.name, role: user.role, email: user.email };
    setStored(KEYS.session, this.session);
    return { ok: true, role: user.role };
  },
  logout() { this.session = null; localStorage.removeItem(KEYS.session); },
  updateProfile(userId, patch) {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, ...patch } : u));
    setStored(KEYS.users, this.users);
    if (this.session && this.session.userId === userId && patch.name) {
      this.session = { ...this.session, name: patch.name };
      setStored(KEYS.session, this.session);
    }
  },
  addComplaint(data) {
    const id = nextComplaintId(this.complaints);
    const c = {
      id, status: 'Pending', assignedWorkerId: null, assignedWorkerName: null,
      createdAt: nowISO(), updatedAt: nowISO(),
      activity: [{ date: nowISO(), text: 'Complaint submitted.' }],
      feedback: null, ...data,
    };
    this.complaints.unshift(c);
    setStored(KEYS.complaints, this.complaints);
    return c;
  },
  updateComplaint(id, patch, activityText) {
    this.complaints = this.complaints.map((c) => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch, updatedAt: nowISO() };
      if (activityText) updated.activity = [...c.activity, { date: nowISO(), text: activityText }];
      return updated;
    });
    setStored(KEYS.complaints, this.complaints);
  },
  addAnnouncement(data) {
    const a = { id: uid('an'), createdAt: nowISO(), ...data };
    this.announcements.unshift(a);
    setStored(KEYS.announcements, this.announcements);
  },
  updateAnnouncement(id, patch) {
    this.announcements = this.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a));
    setStored(KEYS.announcements, this.announcements);
  },
  deleteAnnouncement(id) {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    setStored(KEYS.announcements, this.announcements);
  },
  addFeedback(fb) {
    const f = { id: uid('fb'), date: nowISO(), ...fb };
    this.feedbacks.unshift(f);
    setStored(KEYS.feedback, this.feedbacks);
    this.updateComplaint(fb.complaintId, { feedback: f }, null);
  },
  addGateEntry(data) {
    const g = { id: uid('ge'), entryTime: nowISO(), exitTime: null, ...data };
    this.gateEntries.unshift(g);
    setStored(KEYS.gate, this.gateEntries);
  },
  markExit(id) {
    this.gateEntries = this.gateEntries.map((g) => (g.id === id ? { ...g, exitTime: nowISO() } : g));
    setStored(KEYS.gate, this.gateEntries);
  },
};

/* THEME */
const THEME_KEY = 'resicare_theme';
function getTheme() { return localStorage.getItem(THEME_KEY) || 'light'; }
function resolvedTheme(pref) {
  if (pref === 'system') return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return pref;
}
function applyTheme() { document.documentElement.setAttribute('data-theme', resolvedTheme(getTheme())); }
function setTheme(pref) { localStorage.setItem(THEME_KEY, pref); applyTheme(); }
function toggleTheme() { setTheme(resolvedTheme(getTheme()) === 'dark' ? 'light' : 'dark'); }
function themeToggleButton() {
  const dark = resolvedTheme(getTheme()) === 'dark';
  return `<button data-action="toggle-theme" class="theme-toggle focus-ring" title="Toggle dark mode">${Icon(dark ? 'sun' : 'moon', 17)}</button>`;
}

/* TOASTS */
function showToast(message, type = 'success') {
  const host = document.getElementById('toast-root');
  const icons = { success: '&#10003;', error: '&times;', info: '&#128227;' };
  const colors = { success: 'var(--success)', error: 'var(--error)', info: 'var(--info)' };
  const el = document.createElement('div');
  el.className = 'anim-toast';
  el.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);border-radius:0.65rem;padding:0.75rem 1rem;box-shadow:0 10px 25px -8px rgba(20,20,18,0.18);font-size:0.875rem;font-weight:500;margin-top:8px;';
  el.innerHTML = `<span style="color:${colors[type] || colors.success};font-weight:700;">${icons[type] || icons.success}</span>${esc(message)}`;
  host.appendChild(el);
  setTimeout(() => { el.remove(); }, 3200);
}

/* ICONS */
function Icon(name, size = 18, extraStyle = '') {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;pointer-events:none;${extraStyle}"`;
  const paths = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    complaints: '<path d="M9 4h11v14l-4-3H9z"/><path d="M4 9v9l3-2h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    announcement: '<path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6l-4 4H4a1 1 0 0 0-1 1z"/><path d="M16 8a4 4 0 0 1 0 8"/>',
    gate: '<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/><path d="M4 11h16"/>',
    feedback: '<path d="M12 17.3 6.2 21l1.4-6.4L2.5 9.7l6.5-.6L12 3l3 6.1 6.5.6-4.9 4.9 1.4 6.4z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 3"/>',
    profile: '<circle cx="12" cy="8" r="3.3"/><path d="M5 20c1-4 4.5-6 7-6s6 2 7 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    location: '<path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',
    user: '<circle cx="12" cy="8" r="3.3"/><path d="M5 20c1-4 4.5-6 7-6s6 2 7 6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5.5-5.5L4 21"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12l5 5L19 8"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    star: '<path d="M12 17.3 6.2 21l1.4-6.4L2.5 9.7l6.5-.6L12 3l3 6.1 6.5.6-4.9 4.9 1.4 6.4z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5-5.9M9.9 4.2A9.6 9.6 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M2 2l20 20"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  };
  return `<svg ${attrs}>${paths[name] || ''}</svg>`;
}

/* UI BUILDERS */
function Button({ label, variant = 'primary', size = 'md', extraAttrs = '', extraStyle = '', icon = '' }) {
  const sizes = { sm: 'padding:0.375rem 0.75rem;font-size:0.8125rem;', md: 'padding:0.6rem 1rem;font-size:0.875rem;', lg: 'padding:0.75rem 1.5rem;font-size:1rem;' };
  const variants = {
    primary: `background:var(--primary);color:#fff;`,
    secondary: `background:var(--card);border:1px solid var(--border);color:var(--text-primary);`,
    ghost: `background:transparent;color:var(--text-secondary);`,
    danger: `background:var(--error);color:#fff;`,
  };
  return `<button class="btn focus-ring" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:0.65rem;font-weight:500;border:none;cursor:pointer;${sizes[size]}${variants[variant]}${extraStyle}" ${extraAttrs}>${icon ? Icon(icon, 16) : ''}${esc(label)}</button>`;
}
function fieldWrap(label, innerHtml, errId, hint) {
  return `<div style="margin-bottom:1rem;">
    ${label ? `<label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:0.4rem;">${esc(label)}</label>` : ''}
    ${innerHtml}
    ${hint ? `<p style="font-size:0.75rem;margin-top:0.3rem;color:var(--muted);">${esc(hint)}</p>` : ''}
    ${errId ? `<p id="${errId}" class="field-error" style="font-size:0.75rem;margin-top:0.3rem;color:var(--error);display:none;"></p>` : ''}
  </div>`;
}
function inputStyle() { return 'width:100%;padding:0.65rem 0.9rem;border-radius:0.65rem;border:1px solid var(--border);background:var(--card);color:var(--text-primary);font-size:0.875rem;outline:none;'; }
function StatusBadge(status) {
  const map = {
    Pending: ['var(--warning-bg)', 'var(--warning)'], Assigned: ['var(--info-bg)', 'var(--info)'],
    'In Progress': ['var(--info-bg)', 'var(--info)'], Resolved: ['var(--success-bg)', 'var(--success)'],
    Closed: ['var(--chip-bg)', 'var(--text-secondary)'],
  };
  const [bg, fg] = map[status] || map.Pending;
  return `<span style="display:inline-flex;align-items:center;padding:0.3rem 0.6rem;border-radius:0.5rem;font-size:0.75rem;font-weight:500;white-space:nowrap;background:${bg};color:${fg};">${esc(status)}</span>`;
}
function PriorityBadge(priority) {
  const map = { Low: ['var(--chip-bg)', 'var(--text-secondary)'], Medium: ['var(--info-bg)', 'var(--info)'], High: ['var(--warning-bg)', 'var(--warning)'], Emergency: ['var(--emergency-bg)', 'var(--emergency)'] };
  const [bg, fg] = map[priority] || map.Low;
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:0.3rem 0.6rem;border-radius:0.5rem;font-size:0.75rem;font-weight:500;white-space:nowrap;background:${bg};color:${fg};">${priority === 'Emergency' ? '&#9888; ' : ''}${esc(priority)}</span>`;
}
function EmptyState({ title, message, actionLabel, actionNav, icon = 'complaints' }) {
  return `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:4rem 1.5rem;border-radius:0.85rem;border:1px dashed var(--border);">
    <div style="width:48px;height:48px;border-radius:9999px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;background:var(--success-bg);color:var(--primary);">${Icon(icon, 22)}</div>
    <h3 class="font-display font-bold text-lg" style="margin-bottom:0.25rem;">${esc(title)}</h3>
    <p style="font-size:0.875rem;margin-bottom:1.25rem;max-width:24rem;color:var(--text-secondary);">${esc(message)}</p>
    ${actionLabel ? `<a data-nav="${actionNav}">${Button({ label: actionLabel })}</a>` : ''}
  </div>`;
}
function PageHeader(title, subtitle, actionHtml) {
  return `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem;">
    <div>
      <h1 class="font-display" style="font-size:1.5rem;font-weight:700;">${esc(title)}</h1>
      ${subtitle ? `<p style="font-size:0.875rem;margin-top:0.25rem;color:var(--text-secondary);">${esc(subtitle)}</p>` : ''}
    </div>
    ${actionHtml || ''}
  </div>`;
}
function Card(innerHtml, extraStyle = '') {
  return `<div class="bg-white rounded-xl border" style="padding:1.25rem;${extraStyle}">${innerHtml}</div>`;
}
function StatCard(label, value, tone = 'default') {
  const tones = { default: 'var(--text-primary)', success: 'var(--success)', warning: 'var(--warning)', emergency: 'var(--emergency)' };
  return Card(`<p style="font-size:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.03em;color:var(--muted);">${esc(label)}</p>
    <p class="font-display" style="font-size:1.9rem;font-weight:700;margin-top:0.5rem;color:${tones[tone]};">${esc(value)}</p>`);
}
function UserAvatar(name, size = 36) {
  const initials = (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;color:#fff;flex-shrink:0;background:var(--primary);font-size:${size * 0.38}px;">${esc(initials)}</div>`;
}
function Timeline(status) {
  const stages = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const idx = stages.indexOf(status);
  let html = `<div style="display:flex;align-items:center;width:100%;overflow-x:auto;padding:0.5rem 0;">`;
  stages.forEach((s, i) => {
    html += `<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;min-width:74px;">
      <div style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;background:${i <= idx ? 'var(--primary)' : 'var(--chip-bg)'};color:${i <= idx ? '#fff' : 'var(--muted)'};">${i < idx ? Icon('check', 13) : i + 1}</div>
      <p style="font-size:0.75rem;margin-top:0.4rem;text-align:center;color:${i <= idx ? 'var(--text-primary)' : 'var(--muted)'};font-weight:${i === idx ? 600 : 400};">${s}</p>
    </div>`;
    if (i < stages.length - 1) html += `<div style="height:2px;flex:1;min-width:16px;background:${i < idx ? 'var(--primary)' : 'var(--chip-bg)'};"></div>`;
  });
  return html + `</div>`;
}
function ComplaintCard(c, navPath) {
  return `<a data-nav="${navPath}" class="hover:shadow-sm transition-shadow" style="display:block;text-align:left;background:var(--card);border-radius:0.85rem;border:1px solid var(--border);padding:1rem;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;">
      <div style="min-width:0;">
        <p class="font-mono text-xs" style="color:var(--muted);">${esc(c.id)}</p>
        <p style="font-weight:500;margin-top:0.15rem;" class="truncate">${esc(c.title)}</p>
        <p style="font-size:0.75rem;margin-top:0.25rem;color:var(--text-secondary);">${esc(c.category)} &middot; ${esc(c.tower)}-${esc(c.flat)}</p>
      </div>
      ${StatusBadge(c.status)}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.75rem;">
      ${PriorityBadge(c.priority)}
      <span style="font-size:0.75rem;color:var(--muted);">${fmtDate(c.createdAt)}</span>
    </div>
  </a>`;
}
function AnnouncementCard(a, actionsHtml) {
  const priorityColor = { Normal: 'var(--info)', Important: 'var(--warning)', Emergency: 'var(--emergency)' };
  return Card(`<div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.4rem;">
        <span style="font-size:0.75rem;font-weight:500;padding:0.15rem 0.5rem;border-radius:0.5rem;background:var(--chip-bg);color:var(--text-secondary);">${esc(a.category)}</span>
        ${a.priority !== 'Normal' ? `<span style="font-size:0.75rem;font-weight:500;color:${priorityColor[a.priority]};">${esc(a.priority)}</span>` : ''}
      </div>
      <h3 class="font-display font-bold">${esc(a.title)}</h3>
      <p style="font-size:0.875rem;margin-top:0.25rem;color:var(--text-secondary);">${esc(a.description)}</p>
      <p style="font-size:0.75rem;margin-top:0.5rem;color:var(--muted);">${fmtDate(a.createdAt)}</p>
    </div>
    ${actionsHtml ? `<div style="display:flex;gap:0.75rem;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);">${actionsHtml}</div>` : ''}`);
}
function starsHtml(rating, interactive) {
  let html = '';
  for (let n = 1; n <= 5; n++) {
    html += interactive
      ? `<button type="button" data-star="${n}" class="star-btn" style="color:${n <= rating ? 'var(--warning)' : 'var(--star-empty)'};">${Icon('star', 26)}</button>`
      : `<span style="color:${n <= rating ? 'var(--warning)' : 'var(--star-empty)'};">${Icon('star', 15)}</span>`;
  }
  return html;
}

/* ROUTER */
function navigate(path) { window.location.hash = path; }
function currentHash() { return window.location.hash || '#/'; }
function hashParts() { return currentHash().replace('#', '').split('/').filter(Boolean); }
