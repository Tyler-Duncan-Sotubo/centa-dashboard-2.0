"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import Modal from "@/shared/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { BonusSchema } from "@/schema/bonus.schema";
import { PlusCircle } from "lucide-react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useState } from "react";
import FormError from "@/shared/ui/form-error";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  employee?: {
    id: string;
    name: string;
  } | null;
}

const BonusModal = ({ isOpen, onClose, employee = null }: BonusModalProps) => {
  const [error, setError] = useState("");
  const createBonus = useCreateMutation<{
    amount: string;
    bonusType: string;
    employeeId: string;
  }>({
    endpoint: "/api/bonuses",
    successMessage: "Bonus added successfully!",
    refetchKey: "bonus",
  });

  const form = useForm<z.infer<typeof BonusSchema>>({
    resolver: zodResolver(BonusSchema),
    defaultValues: {
      amount: "0.00",
      employeeId: employee ? employee.id : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof BonusSchema>) => {
    const editedValues = {
      ...values,
      effectiveDate: new Date().toISOString(),
    };
    await createBonus(editedValues, setError, form.reset, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      confirmText="Add Bonus"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        {/* Available Deductions */}
        <h1 className="text-3xl font-bold flex items-center gap-2 my-2">
          <PlusCircle className="text-red-500" /> Add Bonus
        </h1>
        <p className="text-gray-500 font-semibold">
          Add a new bonus for an employee here.
        </p>

        {/* Add New Deduction Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 my-6"
          >
            <FormField
              control={form.control}
              name="bonusType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. performance" />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Apply to Employee */}
            {employee ? (
              <EmployeeSingleSelect
                name="employeeId"
                label="Assign to"
                placeholder="Search employee..."
              />
            ) : (
              <EmployeeSingleSelect
                name="employeeId"
                label="Assign to"
                placeholder="Search employee..."
              />
            )}
          </form>
          {error ? <FormError message={error} /> : ""}
        </Form>
      </section>
    </Modal>
  );
};

export default BonusModal;
