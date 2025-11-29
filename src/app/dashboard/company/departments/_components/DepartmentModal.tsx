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
import FormError from "@/components/ui/form-error";
import { departmentSchema } from "@/schema/department";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  id?: string;
  name?: string;
}

const DepartmentModal = ({
  isOpen,
  onClose,
  id,
  isEditing = false,
  name,
}: DepartmentModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && name) {
      form.reset({ name });
    }
  }, [isEditing, name, form]);

  const updateDepartment = useUpdateMutation({
    endpoint: `/api/department/${id}`,
    successMessage: "Department updated successfully",
    refetchKey: "departments onboarding",
  });

  const createDepartment = useCreateMutation({
    endpoint: "/api/department",
    successMessage: "Department created successfully",
    refetchKey: "departments company-elements onboarding",
  });

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    if (isEditing && id) {
      await updateDepartment(values, setError, onClose);
    } else {
      await createDepartment(values, setError, form.reset, onClose);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Department" : "Add Department"}
      confirmText={isEditing ? "Update" : "Add"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="IT Department" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <EmployeeSingleSelect
            name="headId"
            label="Head of Department"
            placeholder="Select Employee"
          />
        </form>
      </Form>

      {/* Display error message if there is one */}
      {error && <FormError message={error} />}
    </Modal>
  );
};

export default DepartmentModal;
