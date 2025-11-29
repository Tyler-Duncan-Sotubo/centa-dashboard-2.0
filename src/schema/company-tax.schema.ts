import { z } from "zod";

export const companyTaxDetailsSchema = z.object({
  tin: z.string().min(1, "tin is required"),
  nhf_code: z.string().min(1, "NHF is required"),
  pension_code: z.string().min(1, "Pension is required"),
});

export type CompanyTaxDetailsType = z.infer<typeof companyTaxDetailsSchema>;
