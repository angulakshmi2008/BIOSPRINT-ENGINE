// BioSprint Engine - API Client Service Layer
// Connects to Node.js / Express backend with graceful offline fallback

const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizeApiBase = (raw) => {
  if (!raw) return 'http://localhost:5000/api';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};
const API_BASE = normalizeApiBase(rawApiUrl);

class ApiService {
  constructor() {
    this.token = localStorage.getItem('biosprint_token') || null;
  }

  getApiBase() {
    return API_BASE;
  }

  async checkHealth() {
    const rootUrl = API_BASE.replace(/\/api$/, '');
    try {
      const res = await fetch(`${rootUrl}/health`);
      return res.ok;
    } catch {
      try {
        const res2 = await fetch(`${API_BASE}/health`);
        return res2.ok;
      } catch {
        return false;
      }
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('biosprint_token', token);
    } else {
      localStorage.removeItem('biosprint_token');
    }
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      ...this.getHeaders(options.body instanceof FormData),
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      // Re-throw so caller knows if backend is reachable
      throw err;
    }
  }

  // Auth & Identity
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(data) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async googleAuth(payload) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async registerAccessCode(payload) {
    const res = await this.request('/auth/register-access-code', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async unlockCode(emailOrId, accessCode) {
    const res = await this.request('/auth/unlock-code', {
      method: 'POST',
      body: JSON.stringify({ emailOrId, accessCode })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async resetAccessCode(payload) {
    const res = await this.request('/auth/reset-access-code', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getAllUsers() {
    return this.request('/auth/users');
  }

  async updateUserRole(id, role) {
    return this.request(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async updateUserStatus(id, status) {
    return this.request(`/auth/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // offline or token expired
    }
    this.setToken(null);
  }

  // Demo Environment Reset (Port 5001 only)
  async resetDemoStore() {
    return this.request('/demo/reset', { method: 'POST' });
  }

  // Projects
  async getProjects(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/projects${qs ? `?${qs}` : ''}`);
  }

  async createProject(data) {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  // Experiments
  async getExperiments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/experiments${qs ? `?${qs}` : ''}`);
  }

  async createExperiment(data) {
    return this.request('/experiments', { method: 'POST', body: JSON.stringify(data) });
  }

  async addObservation(experimentId, note) {
    return this.request(`/experiments/${experimentId}/observations`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  async updateExperiment(id, data) {
    return this.request(`/experiments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteExperiment(id) {
    return this.request(`/experiments/${id}`, { method: 'DELETE' });
  }

  // Protocols
  async getProtocols(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/protocols${qs ? `?${qs}` : ''}`);
  }

  async createProtocol(data) {
    return this.request('/protocols', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProtocol(id, data) {
    return this.request(`/protocols/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProtocol(id) {
    return this.request(`/protocols/${id}`, { method: 'DELETE' });
  }

  // Samples
  async getSamples(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/samples${qs ? `?${qs}` : ''}`);
  }

  async createSample(data) {
    return this.request('/samples', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSample(id, data) {
    return this.request(`/samples/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSample(id) {
    return this.request(`/samples/${id}`, { method: 'DELETE' });
  }

  // Research Data & Real File Upload
  async getDatasets(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/datasets${qs ? `?${qs}` : ''}`);
  }

  async uploadDataset(formData) {
    return this.request('/datasets/upload', {
      method: 'POST',
      body: formData
    });
  }

  getDatasetDownloadUrl(id) {
    return `${API_BASE}/datasets/${id}/download`;
  }

  async deleteDataset(id) {
    return this.request(`/datasets/${id}`, { method: 'DELETE' });
  }

  // Analysis & Results
  async getAnalyses(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/analyses${qs ? `?${qs}` : ''}`);
  }

  async createAnalysis(data) {
    return this.request('/analyses', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteAnalysis(id) {
    return this.request(`/analyses/${id}`, { method: 'DELETE' });
  }

  async getResults(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/results${qs ? `?${qs}` : ''}`);
  }

  async createResult(data) {
    return this.request('/results', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteResult(id) {
    return this.request(`/results/${id}`, { method: 'DELETE' });
  }

  // Provenance DAG
  async getProvenance(experimentId) {
    return this.request(`/provenance/${experimentId}`);
  }

  // Reports & Audits
  async getReportsSummary() {
    return this.request('/reports/summary');
  }

  getExportCsvUrl(entity) {
    return `${API_BASE}/reports/export/${entity}`;
  }

  async getAuditLogs(limit = 50) {
    return this.request(`/audit-logs?limit=${limit}`);
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(preferences) {
    return this.request('/settings', { method: 'PUT', body: JSON.stringify({ preferences }) });
  }

  async resetDatabase() {
    return this.request('/settings/reset', { method: 'POST' });
  }

  async loadSeedFixtures() {
    return this.request('/settings/seed', { method: 'POST' });
  }
}

export const api = new ApiService();
export default api;
