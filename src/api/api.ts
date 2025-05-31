import axiosInstance from '../axios/axios';
import type { Branch, BranchAdmin } from './types'; // adjust path as needed
import type { AxiosResponse } from 'axios';

// Define Log type
interface Log {
  _id: string;
  title?: string;
  description?: string;
  createdAt: string;
  status?: string;
  [key: string]: any; // Allow additional properties
}

// Define Log response type
interface LogsResponse {
  data: Log[];
}

// Define KYC-specific types
interface KYCForm {
  id: string;
  [key: string]: any; // Add other KYC form properties as needed
}

interface KYCFormsResponse {
  data: KYCForm[];
}

interface KYCAcceptData {
  spreadValue: number;
  branchAdminId: string;
}

interface KYCRejectData {
  reasons: string[];
}

interface KYCResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Define login-specific types
interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    userId: string;
    name: string;
    email: string;
    branch: string;
  };
}

// Define Customer types
interface Customer {
  _id: string;
  customerName: string;
  userName: string;
  nationality?: string;
  residence?: string;
  sourceOfIncome?: string;
  idNumber?: string;
  customerPassword: string;
  customerEmail: string;
  customerPhone: string;
  bankAccountNumber?: string;
  spreadValue?: number;
  dateOfBirth?: Date;
  cash?: number;
  document?: {
    url?: string;
    key?: string;
  };
  image?: {
    url?: string;
    key?: string;
  };
  documentFront?: {
    url?: string;
    key?: string;
  };
  branch: Array<{
    branch: string;
    gold: number;
  }>;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'registered';
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Branch API Functions
export const createBranch = (data: Branch): Promise<AxiosResponse<Branch>> => {
  return axiosInstance.post('/branch', data);
};

export const getAllBranches = (): Promise<AxiosResponse<Branch[]>> => {
  return axiosInstance.get('/branch');
};

export const getBranchById = (id: string): Promise<AxiosResponse<Branch>> => {
  return axiosInstance.get(`/branch/${id}`);
};

export const updateBranch = (id: string, data: Branch): Promise<AxiosResponse<Branch>> => {
  return axiosInstance.put(`/branch/${id}`, data);
};

export const deleteBranch = (id: string): Promise<AxiosResponse<void>> => {
  return axiosInstance.delete(`/branch/${id}`);
};

export const updateBranchCharge = (id: string, chargeData: any): Promise<AxiosResponse<any>> => {
  return axiosInstance.put(`/branch/${id}/charge`, chargeData);
};

// Branch Admin API Functions
export const createBranchAdmin = (formData: FormData): Promise<AxiosResponse<BranchAdmin>> => {
  return axiosInstance.post('/branch-admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAllBranchAdmins = async (): Promise<AxiosResponse<BranchAdmin[]>> => {
  return axiosInstance.get('/branch-admin');
};

export const getBranchAdminById = (id: string): Promise<AxiosResponse<BranchAdmin>> => {
  return axiosInstance.get(`/branch-admin/${id}`);
};

export const updateBranchAdmin = (id: string, formData: FormData): Promise<AxiosResponse<BranchAdmin>> => {
  return axiosInstance.put(`/branch-admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteBranchAdmin = (id: string): Promise<AxiosResponse<void>> => {
  return axiosInstance.delete(`/branch-admin/${id}`);
};

// KYC Management API Functions
export const getAllKYCForms = async (): Promise<KYCFormsResponse> => {
  const response = await axiosInstance.get('/kyc');
  return response;
};

export const acceptKYC = async (id: string, data: KYCAcceptData): Promise<KYCResponse> => {
  try {
    const response = await axiosInstance.post(`/kyc/accept/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error accepting KYC:', error);
    throw new Error(error.response?.data?.message || 'Failed to accept KYC');
  }
};

export const rejectKYC = async (id: string, data: KYCRejectData): Promise<KYCResponse> => {
  try {
    const response = await axiosInstance.post(`/kyc/reject/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting KYC:', error);
    throw new Error(error.response?.data?.message || 'Failed to reject KYC');
  }
};

// Customer API Functions
export const getAllCustomers = async (): Promise<AxiosResponse<Customer[]>> => {
  return axiosInstance.get('/customers');
};

export const getCustomerById = (id: string): Promise<AxiosResponse<Customer>> => {
  return axiosInstance.get(`/customers/${id}`);
};

export const searchCustomers = async (searchTerm: string): Promise<AxiosResponse<Customer[]>> => {
  return axiosInstance.get(`/customers/search?q=${encodeURIComponent(searchTerm)}`);
};

// Log API Function
export const getAllLogs = async (): Promise<AxiosResponse<Log[]>> => {
  try {
    const response = await axiosInstance.get('/logs');
    return response;
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch logs');
  }
};

// Authentication API Functions
export const loginBranchAdmin = async (userId: string, password: string, role: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/branch-admin-login', {
      userId,
      password,
      role,
    });
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', response.data.admin.userId);
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};