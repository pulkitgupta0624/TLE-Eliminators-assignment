import apiClient from './client.js';

export const getDashboard = async () => {
  const response = await apiClient.get('/user/dashboard');
  return response.data;
};

export const getSessions = async () => {
  const response = await apiClient.get('/user/sessions');
  return response.data;
};

export const logoutDevice = async (sessionId) => {
  const response = await apiClient.delete(`/user/sessions/${sessionId}`);
  return response.data;
};

export const logoutAllDevices = async () => {
  const response = await apiClient.post('/user/sessions/logout-all');
  return response.data;
};