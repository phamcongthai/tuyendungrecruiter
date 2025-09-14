import { apiClient } from './apiClient';

export interface JobCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  views: number;
  recruiterId?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobCategoriesResponse {
  success: boolean;
  message: string;
  data: JobCategory[];
  total: number;
}

export const jobCategoriesAPI = {
  // Get all job categories
  getAllCategories: async (): Promise<JobCategoriesResponse> => {
    const response = await apiClient.get('/job-categories');
    return response.data;
  },

  // Get active job categories only
  getActiveCategories: async (): Promise<JobCategoriesResponse> => {
    const response = await apiClient.get('/job-categories?status=active');
    console.log(response);
    
    return response.data;
  },

  // Get job category by ID
  getCategoryById: async (id: string): Promise<{ success: boolean; message: string; data?: JobCategory }> => {
    const response = await apiClient.get(`/job-categories/${id}`);
    return response.data;
  },

  // Create new job category
  createCategory: async (categoryData: Partial<JobCategory>): Promise<{ success: boolean; message: string; data?: JobCategory }> => {
    const response = await apiClient.post('/job-categories', categoryData);
    return response.data;
  },

  // Update job category
  updateCategory: async (id: string, categoryData: Partial<JobCategory>): Promise<{ success: boolean; message: string; data?: JobCategory }> => {
    const response = await apiClient.patch(`/job-categories/${id}`, categoryData);
    return response.data;
  },

  // Delete job category
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/job-categories/${id}`);
    return response.data;
  },

  // Toggle category status
  toggleCategoryStatus: async (id: string): Promise<{ success: boolean; message: string; data?: JobCategory }> => {
    const response = await apiClient.patch(`/job-categories/${id}/toggle-status`);
    return response.data;
  },
};
