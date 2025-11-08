import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL as string;
const axiosInstance = axios.create({ baseURL, withCredentials: true });
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenRecruiter');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type JobPackage = {
  _id: string;
  packageName: string;
  price: number;
  durationDays: number;
  isActive: boolean;
};

export const fetchActiveJobPackages = async (): Promise<{ data: JobPackage[]; total: number }> => {
  const res = await axiosInstance.get('/job-packages', { params: { page: 1, limit: 100 } });
  return { data: res.data?.data || [], total: res.data?.total || 0 };
};
