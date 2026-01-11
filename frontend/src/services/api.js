import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (data) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  disable: (id) => api.patch(`/users/${id}/disable`),
  enable: (id) => api.patch(`/users/${id}/enable`),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  disable: (id) => api.patch(`/customers/${id}/disable`),
  enable: (id) => api.patch(`/customers/${id}/enable`),
  getQuotations: (id) => api.get(`/customers/${id}/quotations`),
};

// Machines API
export const machinesAPI = {
  getAll: (params) => api.get('/machines', { params }),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  disable: (id) => api.patch(`/machines/${id}/disable`),
  enable: (id) => api.patch(`/machines/${id}/enable`),
  getTypes: () => api.get('/machines/types'),
};

// Auxiliary Costs API
export const auxiliaryAPI = {
  getAll: (params) => api.get('/auxiliary-costs', { params }),
  getById: (id) => api.get(`/auxiliary-costs/${id}`),
  create: (data) => api.post('/auxiliary-costs', data),
  update: (id, data) => api.put(`/auxiliary-costs/${id}`, data),
  disable: (id) => api.patch(`/auxiliary-costs/${id}/disable`),
  enable: (id) => api.patch(`/auxiliary-costs/${id}/enable`),
};

// Quotations API
export const quotationsAPI = {
  getAll: (params) => api.get('/quotations', { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`),
  getStatistics: () => api.get('/quotations/statistics'),
  
  // Export
  exportPDF: (id) => api.get(`/quotations/${id}/export/pdf`, { responseType: 'blob' }),
  exportExcel: (id) => api.get(`/quotations/${id}/export/excel`, { responseType: 'blob' }),
  
  // Workflow
  submit: (id, data) => api.post(`/quotations/${id}/submit`, data),
  engineerApprove: (id, data) => api.post(`/quotations/${id}/engineer-approve`, data),
  managementApprove: (id, data) => api.post(`/quotations/${id}/management-approve`, data),
  reject: (id, data) => api.post(`/quotations/${id}/reject`, data),
  issue: (id, data) => api.post(`/quotations/${id}/issue`, data),
  revertToDraft: (id, data) => api.post(`/quotations/${id}/revert-draft`, data),
  
  // Parts
  addPart: (quotationId, data) => api.post(`/quotations/${quotationId}/parts`, data),
  updatePart: (quotationId, partId, data) => api.put(`/quotations/${quotationId}/parts/${partId}`, data),
  deletePart: (quotationId, partId) => api.delete(`/quotations/${quotationId}/parts/${partId}`),
  
  // Operations
  addOperation: (quotationId, partId, data) => 
    api.post(`/quotations/${quotationId}/parts/${partId}/operations`, data),
  updateOperation: (quotationId, partId, operationId, data) => 
    api.put(`/quotations/${quotationId}/parts/${partId}/operations/${operationId}`, data),
  deleteOperation: (quotationId, partId, operationId) => 
    api.delete(`/quotations/${quotationId}/parts/${partId}/operations/${operationId}`),
  
  // Auxiliary Costs
  addAuxCost: (quotationId, partId, data) => 
    api.post(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs`, data),
  updateAuxCost: (quotationId, partId, auxCostId, data) => 
    api.put(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs/${auxCostId}`, data),
  deleteAuxCost: (quotationId, partId, auxCostId) => 
    api.delete(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs/${auxCostId}`),
};

export default api;
