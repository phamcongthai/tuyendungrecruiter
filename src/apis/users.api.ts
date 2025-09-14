import { apiClient } from './apiClient';

export interface UserCvData {
  user: {
    _id: string;
    accountId: string;
    avatar?: string;
    desiredPosition?: string;
    summaryExperience?: string;
    skills?: string[];
    cvId?: string;
    cvFields?: Record<string, string>;
  };
  cvTemplate?: {
    _id: string;
    name: string;
    title: string;
    html: string;
    css: string;
  } | null;
}

export const usersAPI = {
  // Lấy dữ liệu CV của user theo accountId
  getCvDataByAccountId: async (accountId: string): Promise<UserCvData> => {
    const response = await apiClient.get(`/users/by-account/${accountId}/cv-data`);
    return response.data;
  },

  // Lấy thông tin user theo accountId
  getUserByAccountId: async (accountId: string) => {
    const response = await apiClient.get(`/users/by-account/${accountId}`);
    return response.data;
  }
};
