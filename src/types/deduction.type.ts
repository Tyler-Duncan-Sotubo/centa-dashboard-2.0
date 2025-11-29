export type Deduction = {
  id: string;
  employee_id: string;
  firstName: string;
  lastName: string;
  employee_number: number;
  deduction_name: string;
  amount: number;
  reason: string;
};

export enum DeductionCode {
  UNION_DUES = "UNION_DUES",
  COOP_SOCIETY = "COOP_SOCIETY",
  CUSTOM = "CUSTOM",
  WELFARE = "WELFARE",
}

export type DeductionType = {
  id: string; // or number if using SERIAL
  name: string;
  code: DeductionCode;
  systemDefined: boolean;
  requiresMembership: boolean;
};

// types/employee-deductions.type.ts

export type EmployeeDeduction = {
  id: string; // or number, depending on your DB (uuid or serial)
  employeeId: string;
  employeeName: string;
  deductionTypeName: string;
  rateType: "fixed" | "percentage";
  rateValue: string; // stored as string to match Zod & form input
  startDate: string; // ISO date string
  endDate?: string | null;
  metadata?: Record<string, string>;
  isActive: boolean;
};

export type DeductionBreakdownItem = {
  payrollMonth: string;
  paye: number | string;
  pension: number | string;
  nhf: number | string;
  custom: number | string;
};

export type EmployerCostBreakdownItem = {
  payrollMonth: string;
  gross: number | string;
  employerPension: number | string;
  totalCost: number | string;
};
