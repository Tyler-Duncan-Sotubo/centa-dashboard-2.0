// expense.schema.ts
import { z } from "zod";

export const expenseSchema = z.object({
  employeeId: z.string().min(1, "Requester is required"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.coerce.string().min(0.01, "Amount must be greater than zero"),
  paymentMethod: z.string().optional(),
});

export type ExpenseForm = z.infer<typeof expenseSchema>;
