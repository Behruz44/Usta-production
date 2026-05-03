import axiosInstance from './config';

export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await axiosInstance.put(`/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await axiosInstance.put(`/users/${id}/unblock`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
