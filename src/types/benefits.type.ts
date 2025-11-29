export interface BenefitGroup {
  id: string;
  name: string;
  description?: string;
  rules: {
    onlyConfirmed?: boolean;
    minMonths?: number;
    minAge?: number;
    departments?: string[];
    employmentTypes?: string[];
  };
  createdAt: string;
}

export type BenefitPlan = {
  id: string;
  name: string;
  description: string;
  category: string;
  coverageOptions: string[];
  cost: Record<string, string>;
  startDate: string;
  endDate: string;
  split: "employee" | "employer" | "shared";
  employerContribution: number;
};

export type BenefitEnrollment = {
  id: string;
  employeeId: string;
  benefitPlanId: string;
  planName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  monthlyCost: Record<string, string>; // e.g. { "Employee Only": "5000" }
  category: string;
  selectedCoverage: string;
};
