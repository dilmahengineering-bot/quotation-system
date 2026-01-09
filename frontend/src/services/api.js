import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle token expiration
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

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  logout: () => api.post('/auth/logout'),
};

// User Management API (Admin only)
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  disable: (id) => api.patch(`/users/${id}/disable`),
  enable: (id) => api.patch(`/users/${id}/enable`),
};

// Machine API
export const machineAPI = {
  getAll: () => api.get('/machines'),
  getById: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  disable: (id) => api.patch(`/machines/${id}/disable`),
  enable: (id) => api.patch(`/machines/${id}/enable`),
};

// Customer API
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  disable: (id) => api.patch(`/customers/${id}/disable`),
  enable: (id) => api.patch(`/customers/${id}/enable`),
};

// Auxiliary Cost API
export const auxiliaryCostAPI = {
  getAll: () => api.get('/auxiliary-costs'),
  getById: (id) => api.get(`/auxiliary-costs/${id}`),
  create: (data) => api.post('/auxiliary-costs', data),
  update: (id, data) => api.put(`/auxiliary-costs/${id}`, data),
  disable: (id) => api.patch(`/auxiliary-costs/${id}/disable`),
  enable: (id) => api.patch(`/auxiliary-costs/${id}/enable`),
};

// Quotation API
export const quotationAPI = {
  getAll: () => api.get('/quotations'),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  updateStatus: (id, status) => api.patch(`/quotations/${id}/status`, { status }),
  delete: (id) => api.delete(`/quotations/${id}`),
};

export default api;
