import api from './interceptor.api';
import type { CreateCompanyData, UpdateCompanyData, CompanyProfile } from '../types/profile.type';

export interface CompanyResponse {
  success: boolean;
  message: string;
  data?: CompanyProfile;
}

export interface CompaniesResponse {
  success: boolean;
  message: string;
  data?: CompanyProfile[];
}

export interface CompaniesListResponse {
  success: boolean;
  message: string;
  data: CompanyProfile[];
  total: number;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const companyAPI = {
  // Get company by ID
  getCompany: async (companyId: string): Promise<CompanyResponse> => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get company' };
    }
  },

  // Get all companies (for selection)
  getAllCompanies: async (): Promise<CompaniesResponse> => {
    try {
      const response = await api.get('/companies');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get companies' };
    }
  },

  // Get companies created by current recruiter
  getMyCompanies: async (): Promise<CompaniesResponse> => {
    try {
      const response = await api.get('/companies/my');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get my companies' };
    }
  },

  // Get companies with pagination (for forms)
  getCompanies: async (filters: CompanyFilters = {}): Promise<CompaniesListResponse> => {
    try {
      const { page = 1, limit = 100, search = '' } = filters;
      const params = { page, limit, search };
      
      const response = await api.get('/companies', { params });
      
      return {
        success: true,
        message: 'Companies fetched successfully',
        data: response.data?.data || [],
        total: response.data?.total || 0,
      };
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get companies' };
    }
  },

  // Create new company
  createCompany: async (data: CreateCompanyData): Promise<CompanyResponse> => {
    try {
      const response = await api.post('/companies', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to create company' };
    }
  },

  // Update company
  updateCompany: async (companyId: string, data: UpdateCompanyData): Promise<CompanyResponse> => {
    try {
      const response = await api.patch(`/companies/${companyId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update company' };
    }
  },

  // Upload company logo
  uploadLogo: async (companyId: string, file: File): Promise<CompanyResponse> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post(`/companies/${companyId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to upload logo' };
    }
  },

  // Delete company
  deleteCompany: async (companyId: string): Promise<CompanyResponse> => {
    try {
      const response = await api.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to delete company' };
    }
  },
};

// Export individual functions for convenience
export const fetchCompanies = companyAPI.getCompanies;
export const createCompany = companyAPI.createCompany;
export const updateCompany = companyAPI.updateCompany;
export const deleteCompany = companyAPI.deleteCompany;

export default companyAPI;