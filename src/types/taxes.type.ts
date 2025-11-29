export interface Taxes {
  id: string;
  tax_type: string;
  total_deductions: string;
  status: "pending" | "completed";
  month: string;
}
