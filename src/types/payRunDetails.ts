// src/types/payRunDetails.ts

export interface EmployeeDetail {
  employeeId: string;
  name: string;
  grossSalary: number;
  netSalary: number;
  approvalStatus: "pending" | "approved" | "rejected" | "completed";
  paymentStatus: "pending" | "paid" | "in-progress";
  payeTax: number;
  pensionContribution: number;
  nhfContribution: number;
  employerPensionContribution: number;
  additionalDeductions: number;
  customDeductions: number;
  taxableIncome: number;
  salaryAdvance: number;
  payrollMonth: string;
  payrollRunId: string;
  payslip_pdf_url: string;
  bonuses: number;
  totalDeductions: number;
  payrollDate: string;
  isStarter: boolean;
  isLeaver: boolean;
  voluntaryDeductions: {
    typeId: string;
    amount: string;
  }[];
  reimbursements: {
    expenseName: string;
    amount: string;
  }[];
}

export interface PayRunDetails {
  totalCostOfPayroll: number;
  totalPensionContribution: number;
  totalPAYE: number;
  totalNHFContribution: number;
  payrollRunId: string;
  employees: EmployeeDetail[];
}
