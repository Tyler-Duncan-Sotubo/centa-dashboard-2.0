"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import FormError from "@/shared/ui/form-error";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { BadgeMinus } from "lucide-react";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useSession } from "next-auth/react";
import { CreateEmployeeDeductionSchema } from "@/schema/deductions.schema";
import { DeductionType } from "@/types/deduction.type";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DateInput } from "@/shared/ui/date-input";
import { EmployeeSingleSelect } from "@/shared/ui/employee-single-select";

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  employee?: {
    id: string;
    name: string;
  } | null;
}

const DeductionModal = ({
  isOpen,
  onClose,
  isEditing = false,
  employee = null,
}: DeductionModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const form = useForm<z.infer<typeof CreateEmployeeDeductionSchema>>({
    resolver: zodResolver(CreateEmployeeDeductionSchema),
    defaultValues: {
      employeeId: employee?.id || "",
      deductionTypeId: "",
      rateType: "fixed",
      rateValue: "",
      startDate: new Date().toISOString().slice(0, 10), // today
      isActive: true,
    },
  });

  const fetchDeductionTypes = async () => {
    const res = await axiosInstance.get("/api/deductions/types");
    return res.data.data;
  };

  const { data: deductionTypes, isLoading: isLoadingTypes } = useQuery<
    DeductionType[]
  >({
    queryKey: ["deductionTypes"],
    queryFn: fetchDeductionTypes,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const createDeductions = useCreateMutation({
    endpoint: "/api/deductions/employee-deductions",
    successMessage: "Deduction assigned successfully",
    refetchKey: "employeeDeductions",
  });

  const onSubmit = async (
    values: z.infer<typeof CreateEmployeeDeductionSchema>,
  ) => {
    await createDeductions(values, setError, form.reset, onClose);
  };

  if (status === "loading" || isLoadingTypes) return <Loading />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Deduction"
      confirmText={isEditing ? "Update" : "Assign"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <section>
        <h1 className="text-3xl font-bold flex items-center gap-2 ">
          <BadgeMinus className="text-red-500" /> Assign Deduction
        </h1>
        <p className="text-gray-500 font-semibold">
          Assign a deduction type to an employee.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 my-6"
          >
            {/* Deduction Type */}
            <FormField
              control={form.control}
              name="deductionTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deduction Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deduction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deductionTypes?.map((type: DeductionType) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate Type */}
            <FormField
              control={form.control}
              name="rateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="fixed or percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate Value */}
            <FormField
              control={form.control}
              name="rateValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 500 or 10%" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DateInput
                      {...field}
                      value={field.value ?? ""}
                      onChange={(date) => field.onChange(date.toString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date (optional) */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DateInput
                      {...field}
                      value={field.value ?? ""}
                      onChange={(date) => field.onChange(date.toString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee Dropdown (if not passed from props) */}
            {!employee && (
              <EmployeeSingleSelect
                name="employeeId"
                label="Assign to"
                placeholder="Search employee..."
              />
            )}

            {error && <FormError message={error} />}
          </form>
        </Form>
      </section>
    </Modal>
  );
};

export default DeductionModal;
