import axiosInstance from './config';

export const getProducts = async (params = {}) => {
  const response = await axiosInstance.get('/products', { params: { ...params, showAll: true } });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await axiosInstance.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
};

export const updateProduct = async (id, formData) => {
  const response = await axiosInstance.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};
