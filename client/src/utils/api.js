import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Machine API
export const machineApi = {
  getAll: (activeOnly = false) => api.get(`/machines${activeOnly ? '?active_only=true' : ''}`),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  toggle: (id) => api.patch(`/machines/${id}/toggle`),
  delete: (id) => api.delete(`/machines/${id}`),
};

// Customer API
export const customerApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.activeOnly) queryParams.append('active_only', 'true');
    if (params.search) queryParams.append('search', params.search);
    return api.get(`/customers?${queryParams.toString()}`);
  },
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  toggle: (id) => api.patch(`/customers/${id}/toggle`),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Auxiliary Cost API
export const auxiliaryCostApi = {
  getAll: (activeOnly = false) => api.get(`/auxiliary-costs${activeOnly ? '?active_only=true' : ''}`),
  getById: (id) => api.get(`/auxiliary-costs/${id}`),
  create: (data) => api.post('/auxiliary-costs', data),
  update: (id, data) => api.put(`/auxiliary-costs/${id}`, data),
  toggle: (id) => api.patch(`/auxiliary-costs/${id}/toggle`),
  delete: (id) => api.delete(`/auxiliary-costs/${id}`),
};

// Other Cost API
export const otherCostApi = {
  getByQuotationId: (quotationId) => api.get(`/quotations/${quotationId}/other-costs`),
  create: (data) => api.post('/other-costs', data),
  update: (id, data) => api.put(`/other-costs/${id}`, data),
  delete: (id) => api.delete(`/other-costs/${id}`),
};

// Quotation API
export const quotationApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.customerId) queryParams.append('customer_id', params.customerId);
    return api.get(`/quotations?${queryParams.toString()}`);
  },
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  updateStatus: (id, status) => api.patch(`/quotations/${id}/status`, { status }),
  delete: (id) => api.delete(`/quotations/${id}`),
  
  // Parts
  addPart: (quotationId, data) => api.post(`/quotations/${quotationId}/parts`, data),
  updatePart: (quotationId, partId, data) => api.put(`/quotations/${quotationId}/parts/${partId}`, data),
  deletePart: (quotationId, partId) => api.delete(`/quotations/${quotationId}/parts/${partId}`),
  
  // Operations
  addOperation: (quotationId, partId, data) => api.post(`/quotations/${quotationId}/parts/${partId}/operations`, data),
  updateOperation: (quotationId, partId, opId, data) => api.put(`/quotations/${quotationId}/parts/${partId}/operations/${opId}`, data),
  deleteOperation: (quotationId, partId, opId) => api.delete(`/quotations/${quotationId}/parts/${partId}/operations/${opId}`),
  
  // Part Auxiliary Costs
  addPartAuxCost: (quotationId, partId, data) => api.post(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs`, data),
  updatePartAuxCost: (quotationId, partId, auxId, data) => api.put(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs/${auxId}`, data),
  deletePartAuxCost: (quotationId, partId, auxId) => api.delete(`/quotations/${quotationId}/parts/${partId}/auxiliary-costs/${auxId}`),
};

export default api;
