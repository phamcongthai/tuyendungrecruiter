import axios from "axios";
import Swal from 'sweetalert2';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  throw new Error('VITE_API_URL is not defined. Please set it in your environment.');
}

const api = axios.create({
  baseURL,
  withCredentials: true, 
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      
      // Chỉ hiển thị thông báo nếu không phải từ checkRecruiterAccess
      if (!error.config?.url?.includes('/auth/me')) {
        try {
          await api.post("/auth/logout");
        } catch (e) {}
        
        Swal.fire({
          icon: 'warning',
          title: 'Phiên đăng nhập hết hạn',
          text: 'Vui lòng đăng nhập lại để tiếp tục',
          confirmButtonColor: '#00b14f',
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "/login";
        });
      }
    } else if (status === 403) {
      
      // Chỉ hiển thị thông báo nếu không phải từ checkRecruiterAccess
      if (!error.config?.url?.includes('/auth/me')) {
        Swal.fire({
          icon: 'error',
          title: 'Không có quyền truy cập',
          text: 'Bạn không có quyền thực hiện thao tác này',
          confirmButtonColor: '#00b14f'
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
