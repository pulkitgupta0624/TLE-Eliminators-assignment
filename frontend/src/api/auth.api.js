import apiClient from './client.js';
import { collectDeviceFingerprint } from '../utils/deviceFingerprint.js';

export const signup = async (name, email, password) => {
  const response = await apiClient.post('/auth/signup', {
    name,
    email,
    password
  });
  return response.data;
};

export const login = async (email, password) => {
  const fingerprint = collectDeviceFingerprint();
  
  const response = await apiClient.post('/auth/login', {
    email,
    password,
    deviceFingerprint: fingerprint.hash,
    browser: fingerprint.browser,
    os: fingerprint.os,
    deviceType: fingerprint.deviceType,
    screenResolution: fingerprint.screenResolution,
    timezone: fingerprint.timezone,
    language: fingerprint.language
  });
  
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};