import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: false,
});

// ── Request interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor — parse errors into readable strings ─────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      if (err.code === 'ECONNABORTED') {
        err.userMessage = 'Request timed out. Backend may be down or DB is unreachable.';
      } else {
        err.userMessage = 'Cannot connect to server. Is FastAPI running on port 8000?';
      }
      return Promise.reject(err);
    }

    const { status, data } = err.response;

    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        err.userMessage = data.detail.map(e => {
          const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : '';
          return field ? `${field}: ${e.msg}` : e.msg;
        }).join(', ');
      } else {
        err.userMessage = data.detail;
      }
    } else {
      err.userMessage = `Server error (${status})`;
    }

    const isAuthRoute = err.config?.url?.includes('/auth/login') ||
                        err.config?.url?.includes('/auth/signup') ||
                        err.config?.url?.includes('/auth/forgot-password') ||
                        err.config?.url?.includes('/auth/reset-password');
    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup:         (data)  => api.post('/auth/signup', data),
  login:          (data)  => api.post('/auth/login',  data),
  me:             ()      => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
};

// ── Levels ────────────────────────────────────────────────────────────────────
export const levelsAPI = {
  getAll: ()    => api.get('/levels/'),
  getOne: (id)  => api.get(`/levels/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getByLevel:   (levelId) => api.get(`/tasks/${levelId}`),
  completeTask: (taskId)  => api.post('/progress/complete-task', { task_id: taskId }),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressAPI = {
  getAll: () => api.get('/progress/'),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardAPI = {
  getGlobal:    (limit = 20) => api.get(`/leaderboard/?limit=${limit}`),
  getByType:    (type, limit = 50) => api.get(`/leaderboard/?type=${type}&limit=${limit}`),
  getSameLevel: ()           => api.get('/leaderboard/same-level'),
};

// ── Mentors ───────────────────────────────────────────────────────────────────
export const mentorsAPI = {
  getAll: () => api.get('/mentors/'),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getByLevel: (levelId) => api.get(`/roadmap/${levelId}`),
};

// ── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data)                    => api.post('/feedback/', data),
  getTop: (limit = 6)              => api.get(`/feedback/?limit=${limit}`),
  getAll: (limit = 50, offset = 0) => api.get(`/feedback/all?limit=${limit}&offset=${offset}`),
};

export default api;