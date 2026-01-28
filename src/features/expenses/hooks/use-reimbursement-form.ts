"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReimbursementFormValues,
  reimbursementSchema,
} from "../schema/reimbursement.schema";

export function useReimbursementForm(
  initial?: Partial<ReimbursementFormValues>,
) {
  return useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: {
      date: new Date(),
      category: "Travel",
      purpose: "",
      amount: "",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
      ...initial,
    },
  });
}
