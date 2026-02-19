// ==============================
// 🔹 Base Types
// ==============================

export type Department = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  head: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  employees: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
};

export type EmployeeGroup = {
  id: string;
  name: string;
  createdAt: string;
  pay_schedule_id: string;
  payFrequency: string;
  apply_nhf: boolean;
  apply_pension: boolean;
  apply_paye: boolean;
  apply_additional: boolean;
};

// ==============================
// 🔹 Employee Details
// ==============================

export interface Employee {
  id: string;
  employeeNumber: number;
  name: string; // full name
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string; // e.g., "Employee", "Manager"
  avatarUrl?: string;
  job_title: string;
  employmentStatus: string;
  start_date: string;
  annualGross: number;
  hourly_rate?: number;
  bonus?: number;
  commission?: number;

  department_id: string;
  groupId: string;
  applyNHf: boolean;

  // Profile
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  address: string;
  state: string;
  country: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Employment Details
  employmentStartDate: string;
  employmentEndDate?: string;
  probationEndDate?: string;
  confirmed: boolean;

  // Nested Details
  employee_bank_details?: EmployeeBankDetails;
  employee_tax_details?: EmployeeTaxDetails;
}

// ==============================
// 🔹 Bank & Tax Details
// ==============================

export interface EmployeeBankDetails {
  id: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
}

export interface EmployeeTaxDetails {
  id: string;
  tin: string;
  pension_pin: string;
  nhf_number: string;
  consolidated_relief_allowance: number;
  state_of_residence: string;
}

// ==============================
// 🔹 Payroll Breakdown
// ==============================

export interface EmployeePayroll {
  employee_number: number;
  name: string;
  email: string;

  grossSalary: number;
  bonus?: number;
  basic: number;
  housing: number;
  transport: number;
  allowances?: {
    type: string;
    amount: number;
  }[];

  // Deductions
  PAYE: number;
  pension: number;
  NHF: number;
  additionalDeductions?: number;
  totalDeductions: number;

  // Result
  netSalary: number;
  taxableIncome: number;
  effectiveTaxRate: string;
  averageTaxRate: string;
}

export interface EmployeeALL {
  core: {
    id: string;
    employeeNumber: string;
    userId: string;
    departmentId: string;
    jobRoleId: string;
    managerId: string | null;
    costCenterId: string | null;
    locationId: string;
    payGroupId: string;
    employmentStatus: string;
    employmentStartDate:
      | "probation"
      | "active"
      | "on_leave"
      | "resigned"
      | "terminated"
      | undefined;
    employmentEndDate: string | null; // Same for this
    confirmed: boolean;
    probationEndDate: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    companyId: string;
  };
  profile: Record<string, unknown>; // Empty object, so using Record for flexibility
  history: unknown[]; // Can define if the structure of history is available
  dependents: unknown[]; // Same for dependents
  certifications: unknown[]; // Same for certifications
  compensation: {
    id: string;
    employeeId: string;
    grossSalary: number;
    payGroupId: string;
    applyNhf: boolean;
    startDate: string;
    endDate: string | null;
  };
  finance: {
    employeeId: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string | null;
    bankBranch: string;
    currency: string;
    tin: string;
    pensionPin: string;
    nhfNumber: string;
    createdAt: string;
    updatedAt: string;
  };
  groups: unknown[]; // Same for groups
}

export interface IUser {
  avatar: null;
  companyId: string;
  company_name: string;
  department_name: string;
  email: string;
  employee_number: string;
  first_name: string;
  group_id: string;
  id: string;
  job_role: string;
  last_name: string;
  start_date: string;
  userId: string;
  location: string;
  employeeManager: {
    id: string;
    name: string;
    email: string;
  };
}
