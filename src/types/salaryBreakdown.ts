export interface SalaryBreakdown {
  basic: number;
  housing: number;
  transport: number;
  allowances: {
    id: string;
    type: string;
    percentage: number;
  }[];
}
