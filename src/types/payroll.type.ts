export type EmployeePayroll = {
  id: string;
  employeeId: string;
  name: string;
  salary: number;
  status: "Pending" | "Completed" | "failed";
  email: string;
};

export type PayrollRecord = {
  employee_number: string;
  name: string;
  email: string;
  grossSalary: number;
  PAYE: number;
  pension: number;
  NHF: number;
  additionalDeductions: number;
  netSalary: number;
  totalDeductions: number;
};

export type PayrollSummary = {
  payroll_run_id: string;
  payrollDate: string; // Consider using Date if parsing is needed
  payrollMonth: string;
  approvalStatus: "pending" | "approved" | "rejected"; // Adjust based on possible statuses
  paymentStatus: "pending" | "paid" | "failed"; // Adjust based on possible statuses
  totalGrossSalary: number; // Convert from string to number if needed
  employeeCount: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalPayrollCost: number;
};

export type Payslip = {
  payslip_id: string;
  payroll_run_id: string;
  gross_salary: number;
  net_salary: number;
  paye_tax: number;
  pension_contribution: number;
  employer_pension_contribution: number;
  taxable_income: number;
  nhf_contribution: number;
  additionalDeductions: number;
  payroll_month: string; // Format: "YYYY-MM"
  first_name: string;
  last_name: string;
  status: "pending" | "approved" | "rejected"; // Assuming limited statuses
  payment_status: "paid" | "pending";
  payslip_pdf_url: string;
  salaryAdvance: number;
};

// types/payroll.type.ts
export interface RunSummary {
  payrollRunId: string;
  payrollDate: string; // "2025-04-30"
  payrollMonth: string; // "2025-04"
  approvalStatus: string;
  paymentStatus: string;
  totalGross: string; // big integer string
  totalDeductions: string;
  totalBonuses: string;
  totalNet: string;
  employeeCount: string;
  costPerRun: string;
  deltaGross: number;
  pctGross: number;
}

export interface PayrollDashboard {
  runSummaries: RunSummary[];
  yearToDate: {
    year: string;
    totalGrossYTD: string;
    totalDeductionsYTD: string;
    totalBonusesYTD: string;
    totalNetYTD: string;
    employeeCountYTD: string;
  };
  headcount: string;
  totalCurrentSalary: string; // from your schema
  costTrend: Array<{
    month: string;
    monthGross: string;
    monthDeductions: string;
    monthBonuses: string;
    monthNet: string;
    monthCost: string;
    deltaCost: number;
    pctChange: number;
  }>;
  onboardingCompleted: boolean;
}
