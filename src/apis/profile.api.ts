import api from "./interceptor.api";
import type { 
  RecruiterProfile, 
  CreateRecruiterData, 
  UpdateRecruiterData, 
  ProfileResponse 
} from '../types/profile.type';

export const profileAPI = {
  // Lấy thông tin profile
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get("/recruiters/profile");
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Lấy thông tin profile thất bại');
    }
  },

  // Tạo profile mới
  createProfile: async (data: CreateRecruiterData): Promise<ProfileResponse> => {
    try {
      const response = await api.post("/recruiters/profile", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Tạo profile thất bại');
    }
  },

  // Cập nhật profile
  updateProfile: async (data: UpdateRecruiterData): Promise<ProfileResponse> => {
    try {
      const response = await api.patch("/recruiters/profile", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Cập nhật profile thất bại');
    }
  },

  // Xóa profile (soft delete)
  deleteProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.delete("/recruiters/profile");
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Xóa profile thất bại');
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ProfileResponse> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post("/recruiters/profile/avatar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Upload avatar thất bại');
    }
  },
};