"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import {
  Form,
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
import { Employee } from "@/types/employees.type";
import Loading from "@/shared/ui/loading";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export const managerSchema = z.object({
  managerId: z.string().min(0).optional(),
});

interface AssignMangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | undefined;
  managerId?: string;
}

const AssignMangerModal = ({
  isOpen,
  onClose,
  employeeId,
  managerId,
}: AssignMangerModalProps) => {
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof managerSchema>>({
    resolver: zodResolver(managerSchema),
  });

  // Fetch employees function
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/employees/company-managers/all",
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  // Fetch employees list, but disable auto-fetching
  const {
    data: employees,
    refetch: refetchEmployees,
    isLoading: isLoadingEmployees,
  } = useQuery<Employee[]>({
    queryKey: ["managers"],
    queryFn: fetchEmployees,
    enabled: false, // Disable auto-fetching
  });

  // Fetch employees only when modal opens
  useEffect(() => {
    if (isOpen) {
      const cachedEmployees = queryClient.getQueryData<Employee[]>([
        "managers",
      ]);
      if (!cachedEmployees) {
        refetchEmployees();
      }
    }

    if (managerId) {
      form.setValue("managerId", managerId);
    }
  }, [isOpen, refetchEmployees, queryClient, managerId, form]);

  const updateDepartment = useUpdateMutation({
    endpoint: `/api/employees/assign-manager/${employeeId}`,
    successMessage: "Manager assigned successfully",
    refetchKey: "employee",
    onSuccess: () => {
      onClose();
    },
  });

  // Prevent rendering before all necessary data is loaded
  if (isLoadingEmployees) return <Loading />;

  const onSubmit = async (values: z.infer<typeof managerSchema>) => {
    await updateDepartment(values, setError);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Manager"
      confirmText="Assign"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <FormField
            name="managerId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Manager</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search employee" />
                  </SelectTrigger>
                  <SelectContent
                    side="bottom"
                    align="start"
                    className="max-h-64 overflow-auto"
                  >
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Display error message if there is one */}
      {error && <FormError message={error} />}
    </Modal>
  );
};

export default AssignMangerModal;
