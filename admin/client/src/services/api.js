import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('Using API base URL:', API_URL);

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (username, password) => {
  console.log('Attempting login with username:', username);
  try {
    console.log('Making login request to:', `${API_URL}/auth/login`);
    const res = await api.post('/auth/login', { username, password });
    console.log('Login response:', res.data);
    return res;
  } catch (error) {
    console.error('Login error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data || error;
  }
};

// Dashboard
export const getDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/analytics');
    return res;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Employers
export const getAllEmployers = async () => {
  try {
    const res = await api.get('/employers');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleEmployerSuspension = async (employerId, suspended) => {
  try {
    const res = await api.post(`/employers/${employerId}/toggle-suspension`, { suspended });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleEmployerApproval = async (userId, approved) => {
  console.log('toggleEmployerApproval called with:', { userId, approved });
  try {
    const res = await api.post('/employers/toggle-approval', { userId, approved });
    console.log('toggleEmployerApproval response:', res.data);
    return res.data;
  } catch (error) {
    console.error('toggleEmployerApproval error:', error.response?.data || error);
    throw error;
  }
};

export const getEmployerDetails = async (userId) => {
  try {
    const res = await api.get(`/employers/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleUserSuspension = async (userId, suspended) => {
  console.log('toggleUserSuspension called with:', { userId, suspended });
  try {
    const response = await api.post('/users/toggle-suspension', { userId, suspended });
    console.log('toggleUserSuspension response:', response.data);
    return response.data;
  } catch (error) {
    console.error('toggleUserSuspension error:', error.response?.data || error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;