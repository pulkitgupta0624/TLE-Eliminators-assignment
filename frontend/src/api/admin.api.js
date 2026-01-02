import apiClient from './client.js';

export const getAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/admin/users');
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await apiClient.get(`/admin/users/${userId}/details`);
  return response.data;
};

export const getSuspiciousActivity = async () => {
  const response = await apiClient.get('/admin/suspicious');
  return response.data;
};

export const getAllSessions = async () => {
  const response = await apiClient.get('/admin/sessions');
  return response.data;
};

export const forceLogoutUser = async (userId) => {
  const response = await apiClient.post(`/admin/users/${userId}/logout`);
  return response.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await apiClient.post(`/admin/users/${userId}/toggle-status`);
  return response.data;
};
