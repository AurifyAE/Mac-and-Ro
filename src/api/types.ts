// types.ts
interface ChargeToBranch {
    branch: string;
    amount: number;
}

export interface Branch {
    _id?: string;
    branchName: string;
    branchCode?: string;
    branchAddress: string;
    branchPhone: string;
    branchEmail: string;
    chargeTo?: ChargeToBranch[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BranchAdmin{
  _id?: string;
  username: string;
  email: string;
  password: string;
  branchId: string;
  branchName: string;
  address: string;
  phone: string;
  userId: string;
}

