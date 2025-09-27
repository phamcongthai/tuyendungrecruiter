import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CVSampleData {
  _id: string;
  name: string;
  title: string;
  description?: string;
  html: string;
  css: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CVSamplesResponse {
  success: boolean;
  message: string;
  data: {
    cvSamples: CVSampleData[];
    total: number;
    page: number;
    limit: number;
  };
}

export const cvSamplesAPI = {
  // Lấy danh sách CV samples
  getCVSamples: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<CVSamplesResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cv-samples`, { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Không thể lấy danh sách mẫu CV');
    }
  },

  // Lấy CV sample theo ID
  getCVSampleById: async (id: string): Promise<CVSampleData> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cv-samples/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể lấy mẫu CV');
      }
      throw new Error('Không thể lấy mẫu CV');
    }
  },

  // Lấy danh sách CV samples đang hoạt động (public)
  getActiveCVSamples: async (): Promise<CVSampleData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/cv-samples`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể lấy mẫu CV');
      }
      throw new Error('Không thể lấy mẫu CV');
    }
  },

  // Tạo CV sample mới
  createCVSample: async (cvSample: Omit<CVSampleData, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; cvSample: CVSampleData }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cv-samples`, cvSample);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể tạo mẫu CV');
      }
      throw new Error('Không thể tạo mẫu CV');
    }
  },

  // Cập nhật CV sample
  updateCVSample: async (id: string, cvSample: Partial<CVSampleData>): Promise<{ message: string; cvSample: CVSampleData }> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/cv-samples/${id}`, cvSample);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể cập nhật mẫu CV');
      }
      throw new Error('Không thể cập nhật mẫu CV');
    }
  },

  // Xóa CV sample (soft delete)
  deleteCVSample: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cv-samples/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể xóa mẫu CV');
      }
      throw new Error('Không thể xóa mẫu CV');
    }
  },

  // Xóa CV sample vĩnh viễn (hard delete)
  hardDeleteCVSample: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cv-samples/${id}/hard`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể xóa mẫu CV');
      }
      throw new Error('Không thể xóa mẫu CV');
    }
  },

  // Toggle trạng thái active của CV sample
  toggleCVSampleStatus: async (id: string): Promise<{ message: string; cvSample: CVSampleData }> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/cv-samples/${id}/toggle-active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Không thể thay đổi trạng thái mẫu CV');
      }
      throw new Error('Không thể thay đổi trạng thái mẫu CV');
    }
  }
};
