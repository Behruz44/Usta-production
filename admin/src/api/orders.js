import axiosInstance from './config';

export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get('/orders', { params });
  return response.data;
};

export const getOrder = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await axiosInstance.delete(`/orders/${id}`);
  return response.data;
};
