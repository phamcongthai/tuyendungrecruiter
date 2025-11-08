export interface RecruiterProfile {
  _id?: string;
  accountId: string;
  companyId: string;
  position?: string;
  gender: 'male' | 'female';
  province?: string;
  district?: string;
  avatar?: string;
  companyRole: 'admin' | 'member';
  isActive: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Populated company data
  company?: CompanyProfile;
}

export interface CompanyProfile {
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  background?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  industries: string[];
  size?: string;
  taxCode?: string;
  foundedYear?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecruiterData {
  companyId: string;
  position?: string;
  gender: 'male' | 'female';
  province?: string;
  district?: string;
  avatar?: string;
  companyRole?: 'admin' | 'member';
}

export interface UpdateRecruiterData {
  companyId?: string;
  position?: string;
  gender?: 'male' | 'female';
  province?: string;
  district?: string;
  avatar?: string;
  companyRole?: 'admin' | 'member';
  isActive?: boolean;
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  logo?: string;
  background?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  industries?: string[];
  size?: string;
  taxCode?: string;
  foundedYear?: string;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  logo?: string;
  background?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  industries?: string[];
  size?: string;
  taxCode?: string;
  foundedYear?: string;
  isActive?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: RecruiterProfile;
}