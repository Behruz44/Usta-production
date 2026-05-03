import axiosInstance from './config';

export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await axiosInstance.post('/auth/logout', { refreshToken });
  return response.data;
};
