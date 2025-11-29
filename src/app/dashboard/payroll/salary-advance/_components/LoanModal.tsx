"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormError from "@/components/ui/form-error";
import { useQueryClient } from "@tanstack/react-query";
import { loanSchema } from "@/schema/loan.schema";
import { PlusCircle } from "lucide-react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoanModal = ({ isOpen, onClose }: LoanModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof loanSchema>>({
    resolver: zodResolver(loanSchema),
  });

  const refreshHistory = () => {
    queryClient.invalidateQueries({ queryKey: ["loanHistory"] });
  };

  const requestLoan = useCreateMutation({
    endpoint: `/api/salary-advance/request/${form.getValues("employee_id")}`,
    successMessage: "Loan requested successfully",
    refetchKey: "loans",
  });

  async function onSubmit(values: z.infer<typeof loanSchema>) {
    setError(null);
    if (
      values.preferredMonthlyPayment !== undefined &&
      Number(values.preferredMonthlyPayment) >
        values.amount / values.tenureMonths
    ) {
      setError(
        "Your preferred monthly payment is higher than the calculated monthly payment"
      );
      return;
    }

    // check if preferredMonthlyPayment total is equal to amount
    if (
      values.preferredMonthlyPayment !== undefined &&
      Number(values.preferredMonthlyPayment) * values.tenureMonths !==
        values.amount
    ) {
      setError("Preferred Monthly Payment * Tenure should be equal to Amount");
      return;
    }

    await requestLoan(values, setError, form.reset, onClose);
    refreshHistory();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      confirmText="Add"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        {/* Loan Header */}
        <h1 className="text-3xl font-bold flex items-center gap-2 my-2">
          <PlusCircle className="text-blue-500" /> Add Salary Advance
        </h1>
        <p className="text-gray-500 font-semibold">
          Assign a new loan to an employee.
        </p>

        {/* Loan Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 my-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenureMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="e.g. 12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredMonthlyPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Monthly Payment</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assign Loan to Employee */}
            <EmployeeSingleSelect
              name="employee_id"
              label="Assign to"
              placeholder="Search employees..."
            />

            {/* Form Error */}
            {error && <FormError message={error} />}
          </form>
        </Form>
      </section>
    </Modal>
  );
};

export default LoanModal;
