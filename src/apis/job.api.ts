import axios from 'axios';
import type { 
  CreateJobData, 
  UpdateJobData, 
  JobListResponse, 
  JobResponse,
  JobFilters 
} from '../types/job.type';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all jobs with filters and pagination (for recruiters)
export const fetchJobs = async (filters: JobFilters = {}): Promise<JobListResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      jobType,
      workingMode,
      companyId,
      jobCategoryId,
      recruiterId
    } = filters;

    const params: any = {
      page,
      limit,
      search,
    };

    if (status) params.status = status;
    if (jobType) params.jobType = jobType;
    if (workingMode) params.workingMode = workingMode;
    if (companyId) params.companyId = companyId;
    if (jobCategoryId) params.jobCategoryId = jobCategoryId;
    if (recruiterId) params.recruiterId = recruiterId;

    // Use recruiter-specific endpoint
    const response = await axiosInstance.get('/recruiters/jobs', { params });
    
    return {
      success: true,
      message: 'Jobs fetched successfully',
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error: any) {
    console.error('fetchJobs error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

// Get job by ID (for recruiters)
export const fetchJobById = async (id: string): Promise<JobResponse> => {
  try {
    const response = await axiosInstance.get(`/recruiters/jobs/${id}`);
    
    return {
      success: true,
      message: 'Job fetched successfully',
      data: response.data,
    };
  } catch (error: any) {
    console.error('fetchJobById error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch job details');
  }
};

// Create new job (for recruiters)
export const createJob = async (jobData: CreateJobData): Promise<JobResponse> => {
  try {
    const response = await axiosInstance.post('/recruiters/jobs', jobData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      success: true,
      message: 'Job created successfully',
      data: response.data,
    };
  } catch (error: any) {
    console.error('createJob error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

// Update job (for recruiters)
export const updateJob = async (id: string, jobData: UpdateJobData): Promise<JobResponse> => {
  try {
    const response = await axiosInstance.patch(`/recruiters/jobs/${id}`, jobData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return {
      success: true,
      message: 'Job updated successfully',
      data: response.data,
    };
  } catch (error: any) {
    console.error('updateJob error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

// Delete job (soft delete) for recruiters
export const deleteJob = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    await axiosInstance.patch(`/recruiters/jobs/delete/${id}`);
    
    return {
      success: true,
      message: 'Job deleted successfully',
    };
  } catch (error: any) {
    console.error('deleteJob error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

// Toggle job status (active/inactive) for recruiters
export const toggleJobStatus = async (id: string): Promise<JobResponse> => {
  try {
    const response = await axiosInstance.patch(`/recruiters/jobs/toggle-status/${id}`);
    
    return {
      success: true,
      message: 'Job status updated successfully',
      data: response.data,
    };
  } catch (error: any) {
    console.error('toggleJobStatus error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to toggle job status');
  }
};

export default {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
};