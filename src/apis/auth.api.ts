import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_URL is not defined. Please set it in your environment.');
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreement: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}

export const authAPI = {
  // Đăng ký nhà tuyển dụng
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/recruiter`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Đăng ký thất bại');
    }
  },

  // Đăng nhập
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
        withCredentials: true, 
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Đăng nhập thất bại');
    }
  },

  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Đăng xuất thất bại');
    }
  },

  // Kiểm tra trạng thái đăng nhập
  checkAuth: async (): Promise<AuthResponse> => {
    try {
      const token = localStorage.getItem('tokenRecruiter');
      if (!token) {
        throw new Error('Không có token');
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Xác thực thất bại');
    }
  },

  // Xác thực email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify?token=${token}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Xác thực email thất bại');
    }
  },

  // Gửi lại email xác thực
  resendVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Gửi lại email thất bại');
    }
  },
};

