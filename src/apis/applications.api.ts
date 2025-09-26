import { apiClient } from './apiClient';

export interface ApplicationItem {
  _id: string;
  jobId: { _id: string; title?: string } | string;
  accountId: string;
  userId?: { _id: string; fullName?: string; email?: string; avatar?: string; desiredPosition?: string; summaryExperience?: string; skills?: string[]; cvData?: any } | string;
  // Populated fields from backend
  userProfile?: {
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    desiredPosition?: string;
    summaryExperience?: string;
    skills?: string[];
    cvData?: any;
  } | null;
  account?: {
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  resumeUrl?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  note?: string;
  createdAt: string;
}

export interface ApplicationsByJobResponse {
  data: ApplicationItem[];
  total: number;
}

export const applicationsAPI = {
  async listByJob(jobId: string, page = 1, limit = 12): Promise<ApplicationsByJobResponse> {
    const res = await apiClient.get<ApplicationsByJobResponse>(`/applications/by-job/${jobId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  async updateStatus(id: string, status: 'pending' | 'viewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn', note?: string) {
    const res = await apiClient.patch(`/applications/${id}/status`, { status, note });
    return res.data as ApplicationItem;
  },
};


