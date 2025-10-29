// Job types based on backend schema
export const JobType = {
  FULLTIME: 'fulltime',
  PARTTIME: 'parttime',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
} as const;

export type JobType = typeof JobType[keyof typeof JobType];

export const WorkingMode = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
} as const;

export type WorkingMode = typeof WorkingMode[keyof typeof WorkingMode];

export interface JobCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface JobData {
  _id?: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  jobType: JobType;
  workingMode: WorkingMode;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  currency?: string;
  headcount?: number;
  levelVi?: string;
  levelEn?: string;
  education?: string;
  deadline?: Date | string;
  status: 'draft' | 'active' | 'expired';
  recruiterId: string;
  companyId: string;
  jobCategoryId?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields from backend
  recruiter?: {
    _id: string;
    accountId: string;
    position?: string;
    avatar?: string;
  };
  company?: {
    _id: string;
    name: string;
    logo?: string;
    location?: string;
  };
  jobCategory?: JobCategory;
}

export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  jobType: JobType;
  workingMode: WorkingMode;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  currency?: string;
  headcount?: number;
  levelVi?: string;
  levelEn?: string;
  education?: string;
  deadline?: Date | string;
  status?: 'draft' | 'active' | 'expired';
  recruiterId?: string;
  companyId?: string;
  jobCategoryId?: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  jobType?: JobType;
  workingMode?: WorkingMode;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  currency?: string;
  headcount?: number;
  levelVi?: string;
  levelEn?: string;
  education?: string;
  deadline?: Date | string;
  status?: 'draft' | 'active' | 'expired';
  recruiterId?: string;
  companyId?: string;
  jobCategoryId?: string;
  deleted?: boolean;
}

export interface JobResponse {
  success: boolean;
  message: string;
  data?: JobData;
}

export interface JobListResponse {
  success: boolean;
  message: string;
  data: JobData[];
  total: number;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  jobType?: JobType;
  workingMode?: WorkingMode;
  companyId?: string;
  jobCategoryId?: string;
  recruiterId?: string;
}

// Utility types for form handling
export type JobFormData = CreateJobData;
export type JobEditFormData = UpdateJobData;

// Constants for display
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FULLTIME]: 'Full-time',
  [JobType.PARTTIME]: 'Part-time',
  [JobType.INTERNSHIP]: 'Internship',
  [JobType.CONTRACT]: 'Contract',
  [JobType.FREELANCE]: 'Freelance',
};

export const WORKING_MODE_LABELS: Record<WorkingMode, string> = {
  [WorkingMode.ONSITE]: 'On-site',
  [WorkingMode.REMOTE]: 'Remote',
  [WorkingMode.HYBRID]: 'Hybrid',
};