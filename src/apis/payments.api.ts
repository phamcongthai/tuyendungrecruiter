import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL as string;
const axiosInstance = axios.create({ baseURL, withCredentials: true });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenRecruiter');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createJobFeaturePayment = async (body: { packageId: string; jobId: string; accountId: string }) => {
  const res = await axiosInstance.post('/payments/vnpay/job-feature/create', body);
  return res.data as { success: boolean; paymentUrl: string; orderId: string };
};
