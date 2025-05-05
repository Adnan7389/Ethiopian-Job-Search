import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

console.log('Using API base URL:', API_URL);
// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Dashboard
export const getDashboardAnalytics = async () => {
  try {
    const res = await api.get('/dashboard/analytics');
    return res.data;
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

export const toggleEmployerApproval = async (userId, approved) => {
  try {
    const res = await api.post('/employers/toggle-approval', { userId, approved });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
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
  try {
    const res = await api.post('/users/toggle-suspension', { userId, suspended });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
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