import { apiClient } from './apiClient';

export interface RankApplicantsResultItem {
  applicationId: string;
  account?: { fullName?: string; email?: string; phone?: string } | null;
  cvPdfUrl?: string | null;
  structured_cv?: {
    desiredPosition: string;
    experienceYears: number;
    level: string;
    objective: string;
  } | null;
  score: number; // 0..100
  debug_info?: any;
}

export interface RankApplicantsResponse {
  job: { _id: string; title: string };
  total: number;
  results: RankApplicantsResultItem[];
}

export const aiAPI = {
  async rankApplicants(jobId: string): Promise<RankApplicantsResponse> {
    const res = await apiClient.get<RankApplicantsResponse>(`/ai/rank-applicants/${jobId}`);
    return res.data;
  },
};












