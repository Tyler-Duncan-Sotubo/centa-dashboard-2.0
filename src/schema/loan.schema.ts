import { z } from "zod";

export const loanSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, { message: "Tenure must be at least 1 month" }),
  tenureMonths: z.coerce
    .number()
    .min(1, { message: "Tenure must be at least 1 month" }),
  employee_id: z.string().uuid("Invalid employee ID"),
  preferredMonthlyPayment: z.coerce.number().optional(),
  status: z.string().optional(),
  reason: z.string().optional(),
  name: z.string().optional(),
});

export type loanSchemaType = z.infer<typeof loanSchema>;

export const editLoanSchema = z.object({
  status: z.string().optional(),
  reason: z.string().optional(),
});

export type editLoanSchemaType = z.infer<typeof editLoanSchema>;
