import axiosInstance from './config';

export const getStats = async () => {
  const response = await axiosInstance.get('/stats');
  return response.data;
};
