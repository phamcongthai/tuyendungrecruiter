export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  role: 'recruiter';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  agreement: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}
