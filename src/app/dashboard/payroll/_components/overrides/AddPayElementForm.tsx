"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

const payElementConfigs = [
  {
    type: "performance_bonus",
    label: "Performance Bonus",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "leave_encashment",
    label: "Leave Encashment",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "reimbursement",
    label: "Reimbursement",
    taxable: false,
    proratable: false,
    recurring: false,
  },
  {
    type: "retro_pay",
    label: "Back Pay / Adjustment",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "joining_bonus",
    label: "Joining Bonus",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "referral_bonus",
    label: "Referral Bonus",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "severance_pay",
    label: "Severance Pay",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "project_completion_bonus",
    label: "Project Completion Bonus",
    taxable: true,
    proratable: false,
    recurring: false,
  },
  {
    type: "night_shift_allowance",
    label: "Night Shift / On-Call Pay",
    taxable: true,
    proratable: true,
    recurring: true,
  },
  {
    type: "commission",
    label: "Sales Commission",
    taxable: true,
    proratable: false,
    recurring: false,
  },
];

const schema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  payElementType: z.string().min(1, "Pay element is required"),
  payElementAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  taxable: z.boolean(),
  proratable: z.boolean(),
  recurring: z.boolean(),
  notes: z.string().min(1, "Note is required"),
});

export default function AddPayElementForm({
  payrollDate,
  setSheetOpen,
}: {
  payrollDate: string;
  setSheetOpen: (open: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      taxable: true,
      proratable: false,
      recurring: false,
    },
  });

  const createPayElement = useCreateMutation({
    endpoint: "/api/payroll-adjustments",
    successMessage: "Pay element created successfully",
    refetchKey: "payroll pay-date",
    onSuccess: () => {
      setError(null);
      setSheetOpen(false);
    },
    onError: (error) => {
      setError(error);
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await createPayElement(
      {
        employeeId: values.employeeId,
        payrollDate,
        amount: parseFloat(values.payElementAmount),
        type: values.payElementType,
        label: values.notes,
        taxable: values.taxable,
        proratable: values.proratable,
        recurring: values.recurring,
      },
      setError,
      form.reset
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        {/* Employee Selection */}

        <EmployeeSingleSelect
          name="employeeId"
          placeholder="Search employee..."
          label="Employee"
        />

        <FormField
          name="payElementType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pay Element</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const config = payElementConfigs.find((p) => p.type === val);
                  if (config) {
                    form.setValue("taxable", config.taxable);
                    form.setValue("proratable", config.proratable);
                    form.setValue("recurring", config.recurring);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select element type" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {payElementConfigs.map((config) => (
                    <SelectItem key={config.type} value={config.type}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="payElementAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter amount" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            name="taxable"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxable</FormLabel>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={field.value}
                />
              </FormItem>
            )}
          />
          <FormField
            name="proratable"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proratable</FormLabel>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />
          <FormField
            name="recurring"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring</FormLabel>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Label or description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-brand text-white">
          Submit
        </Button>
        {error && <FormError message={error} />}
      </form>
    </Form>
  );
}
