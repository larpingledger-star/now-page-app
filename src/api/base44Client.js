const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('auth_token');
}

function setToken(token) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

async function apiCall(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error || 'Request failed', data };
  return data;
}

function normalizeSetting(s) {
  if (!s) return s;
  const out = { ...s };
  for (const k of ['show_name','show_location','show_time','show_kind']) {
    if (out[k] !== undefined) out[k] = !!out[k];
  }
  return out;
}

function normalizeSection(s) {
  if (!s) return s;
  const out = { ...s };
  if (out.enabled !== undefined) out.enabled = !!out.enabled;
  if (typeof out.blocks === 'string') {
    try { out.blocks = JSON.parse(out.blocks); } catch { out.blocks = []; }
  }
  return out;
}

const db = {
  auth: {
    isAuthenticated: async () => !!getToken(),
    me: async () => apiCall('/api/auth/me'),
    loginViaEmailPassword: async (email, password) => {
      const res = await apiCall('/api/auth/loginViaEmailPassword', {
        method: 'POST', body: JSON.stringify({ email, password })
      });
      if (res.access_token) setToken(res.access_token);
      return res;
    },
    register: async ({ email, password }) => {
      return apiCall('/api/auth/register', {
        method: 'POST', body: JSON.stringify({ email, password })
      });
    },
    verifyOtp: async ({ email, otpCode }) => {
      const res = await apiCall('/api/auth/verify-otp', {
        method: 'POST', body: JSON.stringify({ email, otpCode })
      });
      if (res.access_token) setToken(res.access_token);
      return res;
    },
    resendOtp: async (email) => {
      return apiCall('/api/auth/resend-otp', {
        method: 'POST', body: JSON.stringify({ email })
      });
    },
    logout: () => {
      clearToken();
      window.location.href = '/';
    },
    redirectToLogin: (returnTo) => {
      window.location.href = '/login' + (returnTo && returnTo !== '/' ? '?returnTo=' + encodeURIComponent(returnTo) : '');
    },
    resetPasswordRequest: async (email) => {
      return apiCall('/api/auth/resetPasswordRequest', {
        method: 'POST', body: JSON.stringify({ email })
      });
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      return apiCall('/api/auth/resetPassword', {
        method: 'POST', body: JSON.stringify({ resetToken, newPassword })
      });
    },
    setToken,
  },

  app: {
    getPublicSettings: async () => ({ id: 'default', public_settings: {} }),
  },

  entities: {
    SiteSetting: {
      list: async () => {
        const rows = await apiCall('/api/entities/SiteSetting');
        return rows.map(normalizeSetting);
      },
      get: async (id) => {
        const rows = await apiCall('/api/entities/SiteSetting');
        return normalizeSetting(rows.find(r => r.id === id));
      },
      create: async (data) => apiCall('/api/entities/SiteSetting', {
        method: 'POST', body: JSON.stringify(data)
      }),
      update: async (id, data) => apiCall(`/api/entities/SiteSetting/${id}`, {
        method: 'PUT', body: JSON.stringify(data)
      }),
    },
    Section: {
      list: async () => {
        const rows = await apiCall('/api/entities/Section/all');
        return rows.map(normalizeSection);
      },
      filter: async (where, sortKey, limit) => {
        let url = '/api/entities/Section';
        if (where && where.enabled === true) url += '?enabled=true';
        const rows = await apiCall(url);
        let sections = rows.map(normalizeSection);
        if (sortKey === 'order') sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (limit) sections = sections.slice(0, limit);
        return sections;
      },
      get: async (id) => {
        const rows = await apiCall('/api/entities/Section/all');
        return normalizeSection(rows.find(r => r.id === id));
      },
      create: async (data) => {
        const res = await apiCall('/api/entities/Section', {
          method: 'POST', body: JSON.stringify(data)
        });
        return normalizeSection(res);
      },
      update: async (id, data) => {
        const res = await apiCall(`/api/entities/Section/${id}`, {
          method: 'PUT', body: JSON.stringify(data)
        });
        return normalizeSection(res);
      },
      delete: async (id) => apiCall(`/api/entities/Section/${id}`, {
        method: 'DELETE'
      }),
      bulkUpdate: async (items) => apiCall('/api/entities/Section/bulk', {
        method: 'PUT', body: JSON.stringify(items)
      }),
    },
  },

  integrations: {
    Core: {
      UploadPublicFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      },
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      },
    },
  },
};

export const base44 = db;
export default db;
