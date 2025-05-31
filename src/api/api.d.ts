declare module 'api' {
  // Define Log type
  interface Log {
    _id: string;
    title?: string;
    description?: string;
    createdAt: string;
    status?: string;
    [key: string]: any;
  }

  // Branch Management
  export const getAllBranches: () => Promise<any>;
  export const createBranch: (data: any) => Promise<any>;
  export const getBranchById: (id: string) => Promise<any>;
  export const updateBranch: (id: string, data: any) => Promise<any>;
  export const deleteBranch: (id: string) => Promise<any>;
  export const updateBranchCharge: (id: string, chargeData: any) => Promise<any>;

  // Branch Admin Management
  export const createBranchAdmin: (formData: FormData) => Promise<any>;
  export const getAllBranchAdmins: () => Promise<any>;
  export const getBranchAdminById: (id: string) => Promise<any>;
  export const updateBranchAdmin: (id: string, formData: FormData) => Promise<any>;
  export const deleteBranchAdmin: (id: string) => Promise<any>;

  // KYC Management
  export const getAllKYCForms: () => Promise<any>;
  export const acceptKYC: (id: string, data: { spreadValue: number; branchAdminId: string }) => Promise<any>;
  export const rejectKYC: (id: string, data: { reasons: string[] }) => Promise<any>;

  // Customer Management
  export const getAllCustomers: () => Promise<any>;
  export const getCustomerById: (id: string) => Promise<any>;
  export const searchCustomers: (searchTerm: string) => Promise<any>;

  // Log Management
  export const getAllLogs: () => Promise<any>;

  // Authentication
  export const loginBranchAdmin: (userId: string, password: string, role: string) => Promise<any>;
  export const getToken: () => string | null;
  export const logout: () => void;
}