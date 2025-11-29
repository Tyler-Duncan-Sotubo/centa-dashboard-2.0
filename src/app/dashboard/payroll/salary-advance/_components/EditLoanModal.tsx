"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import { Loan } from "@/types/loans.type";
import { editLoanSchema } from "@/schema/loan.schema";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

interface EditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLoan?: Loan | null;
  isEditing: boolean;
}

const EditLoanModal = ({
  isOpen,
  onClose,
  editingLoan,
  isEditing,
}: EditLoanModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof editLoanSchema>>({
    resolver: zodResolver(editLoanSchema),
  });

  const { setValue, reset } = form;

  useEffect(() => {
    if (!isEditing) return;
    if (!editingLoan) return;
    form.setValue("status", editingLoan.status);
  }, [isEditing, editingLoan, setValue, reset, form]);

  const updateLoanRequest = useUpdateMutation({
    endpoint: `/api/salary-advance/update-status/${editingLoan?.loanId}`,
    successMessage: "Loan request updated successfully",
    refetchKey: "loans",
    method: "PATCH",
  });

  async function onSubmit(values: z.infer<typeof editLoanSchema>) {
    setError(null);
    // Update loan status
    if (!editingLoan || !editingLoan.loanId) {
      setError("Loan ID is missing");
      return;
    }
    await updateLoanRequest(values, setError, onClose);
    form.reset();
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      confirmText="Add Loan"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        {/* Loan Header */}
        <h1 className="text-3xl font-bold flex items-center gap-2 my-2">
          Review Loan Request
        </h1>
        <p className="text-gray-500 font-semibold text-sm">
          Review and approve or reject the loan request.
        </p>

        {/* Loan Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 my-6"
          >
            {/* Assign Loan to Employee */}
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Salary Advance</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Review"
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason if Rejected</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Error */}
            {error && <FormError message={error} />}
          </form>
        </Form>
      </section>
    </Modal>
  );
};

export default EditLoanModal;
