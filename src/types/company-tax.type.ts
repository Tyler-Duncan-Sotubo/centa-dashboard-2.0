export interface CompanyTaxDetails {
  id: string;
  company_id: string; // Foreign key reference to companies
  tin: string; // Tax Identification Number
  vat_number?: string | null; // VAT Registration Number (optional)
  nhf_code?: string | null; // NHF Contribution Code (optional)
  pension_code?: string | null; // Pension Scheme Code (optional)
  created_at: Date;
  updated_at?: Date | null;
}
