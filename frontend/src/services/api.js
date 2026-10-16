// ─── Central API Client ───────────────────────────────────────────────────────
// All backend calls go through this file.
// Base URL is auto-detected from env or falls back to Vite proxy.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Generic fetch wrapper with JWT attachment ─────────────────────────────────
const request = async (method, path, body = null) => {
  const headers = { 'Content-Type': 'application/json' };

  // Automatically attach JWT token if present
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  // Attempt to parse JSON regardless of status
  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Invalid response from server' };
  }

  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.details || null;
    throw err;
  }

  return data;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * @param {Object} userData — { name, email, password }
 */
export const registerUser = (userData) => request('POST', '/auth/register', userData);

/**
 * POST /api/auth/login
 * @param {Object} credentials — { email, password }
 */
export const loginUser = (credentials) => request('POST', '/auth/login', credentials);

/**
 * GET /api/auth/me
 */
export const fetchCurrentUser = () => request('GET', '/auth/me');

// ─── Task API ─────────────────────────────────────────────────────────────────

/**
 * GET /api/tasks
 * @param {Object} params — { status, priority, category, search, page, limit, sortBy, sortOrder }
 */
export const fetchTasks = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return request('GET', `/tasks${qs ? `?${qs}` : ''}`);
};

/**
 * GET /api/tasks/stats
 */
export const fetchTaskStats = () => request('GET', '/tasks/stats');

/**
 * GET /api/tasks/:id
 */
export const fetchTaskById = (id) => request('GET', `/tasks/${id}`);

/**
 * POST /api/tasks
 */
export const createTask = (taskData) => request('POST', '/tasks', taskData);

/**
 * PUT /api/tasks/:id
 */
export const updateTask = (id, taskData) => request('PUT', `/tasks/${id}`, taskData);

/**
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = (id, status) =>
  request('PATCH', `/tasks/${id}/status`, { status });

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = (id) => request('DELETE', `/tasks/${id}`);

/**
 * POST /api/tasks/seed-demo
 */
export const seedDemoTasks = () => request('POST', '/tasks/seed-demo');

// ─── Health ───────────────────────────────────────────────────────────────────
export const fetchHealth = () => request('GET', '/health');
