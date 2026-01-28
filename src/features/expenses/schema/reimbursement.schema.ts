"use client";

import { z } from "zod";

export const categories = [
  "Travel",
  "Meals",
  "Supplies",
  "Transport",
  "Accommodation",
  "Entertainment",
  "Other",
] as const;

export const paymentMethods = [
  "Bank Transfer",
  "Cash",
  "Credit Card",
  "Company Card",
  "Mobile Money",
] as const;

export const reimbursementSchema = z.object({
  date: z.date(),
  category: z.enum(categories),
  purpose: z.string().min(3, "Purpose is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Valid number"),
  paymentMethod: z.enum(paymentMethods),
  receiptUrl: z.string().nullable().optional(),
});

export type ReimbursementFormValues = z.infer<typeof reimbursementSchema>;
