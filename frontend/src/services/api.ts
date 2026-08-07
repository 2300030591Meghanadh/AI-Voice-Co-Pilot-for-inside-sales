import axios from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('affordai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
};

export const audioAPI = {
  uploadAudio: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  detectIntent: (transcript: string) =>
    api.post('/intent', { transcript }),
  generateSummary: (transcript: string, intent?: string) =>
    api.post('/summary', { transcript, intent }),
  getSuggestions: (transcript: string, intent?: string) =>
    api.post('/suggestions', { transcript, intent }),
};

export const ragAPI = {
  query: (question: string) =>
    api.post('/rag', { question }),
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listDocuments: () => api.get('/documents'),
};

export const crmAPI = {
  getCustomers: () => api.get('/customers'),
  getCustomerById: (id: number) => api.get(`/customers/${id}`),
  createCustomer: (data: any) => api.post('/customers', data),
  updateCustomer: (id: number, data: any) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id: number) => api.delete(`/customers/${id}`),
  autoSaveCRM: (data: any) => api.post('/crm/save', data),
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

export const followupAPI = {
  getFollowups: () => api.get('/followups'),
  createFollowup: (data: any) => api.post('/followups', data),
  toggleStatus: (id: number) => api.put(`/followups/${id}/toggle-status`),
};
