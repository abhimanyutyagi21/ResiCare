const API = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'resicare_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
export function setToken(token, remember = true) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form; // browser sets the multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event('resicare:unauthorized'));
    }
    throw new ApiError((data && data.error) || 'Something went wrong.', res.status, data && data.fields);
  }
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body });
const patch = (path, body) => request(path, { method: 'PATCH', body });

export const api = {
  auth: {
    login: (b) => post('/auth/login', b),
    signup: (b) => post('/auth/signup', b),
    me: () => request('/auth/me'),
    updateMe: (b) => patch('/auth/me', b),
  },
  users: { workers: () => request('/users/workers') },
  complaints: {
    list: () => request('/complaints'),
    get: (id) => request(`/complaints/${id}`),
    create: (formData) => request('/complaints', { method: 'POST', form: formData }),
    assign: (id, workerId) => patch(`/complaints/${id}/assign`, { workerId }),
    setPriority: (id, priority) => patch(`/complaints/${id}/priority`, { priority }),
    setStatus: (id, status) => patch(`/complaints/${id}/status`, { status }),
    start: (id) => post(`/complaints/${id}/start`),
    resolve: (id) => post(`/complaints/${id}/resolve`),
    confirm: (id) => post(`/complaints/${id}/confirm`),
    feedback: (id, b) => post(`/complaints/${id}/feedback`, b),
  },
  announcements: {
    list: () => request('/announcements'),
    create: (b) => post('/announcements', b),
    update: (id, b) => patch(`/announcements/${id}`, b),
    remove: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),
  },
  feedback: { list: () => request('/feedback') },
  gate: {
    list: () => request('/gate-entries'),
    create: (b) => post('/gate-entries', b),
    markExit: (id) => post(`/gate-entries/${id}/exit`),
  },
};
