"use client";

import { z } from "zod";
import GenericSheet from "@/components/ui/generic-sheet";
import { Button } from "@/components/ui/button";
import { MdPayments } from "react-icons/md";
import { useState } from "react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import FormError from "@/components/ui/form-error";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

export const overRideSchema = z.object({
  notes: z.string().min(1, "Note is required"),
  employeeId: z.string().min(1, "Employee is required"),
});

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
  type: z.string().min(1, "Pay element is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  taxable: z.boolean(),
  proratable: z.boolean(),
  notes: z.string().min(1, "Note is required"),
});

export type OffCycleType = {
  employeeId: string;
  type: string;
  amount: string;
  payrollDate: string;
  taxable?: boolean;
  proratable?: boolean;
  notes?: string;
  id: string;
  name: string;
  payrollRunId: string;
};

export const PayrollOffCyclePicker = ({
  payrollDate,
  setOffCycleEmployees,
}: {
  payrollDate: string | undefined;
  setOffCycleEmployees: React.Dispatch<React.SetStateAction<OffCycleType[]>>;
}) => {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      taxable: true,
      proratable: false,
    },
  });

  const trigger = (
    <Button onClick={() => setSheetOpen(true)} variant="secondary">
      <MdPayments size={20} />
      Add to Payroll
    </Button>
  );

  const createPayElement = useCreateMutation({
    endpoint: "/api/off-cycle",
    successMessage: "Off-cycle pay element created successfully",
    refetchKey: "payroll pay-date",
    onSuccess: (created) => {
      const data = created as { data: OffCycleType[] };
      setOffCycleEmployees(data.data);
      localStorage.setItem("offCycleEmployees", JSON.stringify(data.data));
      setError(null);
      setSheetOpen(false);
    },
    onError: (error) => {
      setError(error);
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!payrollDate) {
      setError("Payroll date is required");
      return;
    }
    await createPayElement(
      {
        ...values,
        payrollDate,
      },
      setError,
      form.reset
    );
  };

  return (
    <GenericSheet
      trigger={trigger}
      title="Add Off-Cycle Pay Element"
      description="Add off-cycle pay element to employee"
      position="right"
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      footer={<div></div>}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Employee Selection */}
          <EmployeeSingleSelect
            name="employeeId"
            label="Select Employee"
            placeholder="Search employee by name or ID"
          />

          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pay Element</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    const config = payElementConfigs.find(
                      (p) => p.type === val
                    );
                    if (config) {
                      form.setValue("taxable", config.taxable);
                      form.setValue("proratable", config.proratable);
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
            name="amount"
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
    </GenericSheet>
  );
};
