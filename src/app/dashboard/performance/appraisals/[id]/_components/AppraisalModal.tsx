"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { Appraisal } from "@/types/performance/appraisal.type";
import { EmployeeSingleSelect } from "@/components/ui/employee-single-select";

const schema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  managerId: z.string().optional(), // Optional if backend resolves it
  cycleId: z.string().min(1, "Cycle is required"),
});

type AppraisalInput = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: Appraisal;
  cycleId: string;
}

export default function AppraisalModal({
  open,
  setOpen,
  initialData,
  cycleId,
}: Props) {
  const isEditing = !!initialData?.id;

  const form = useForm<AppraisalInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? "",
      managerId: initialData?.managerId ?? "",
      cycleId: initialData?.cycleId ?? cycleId ?? "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        employeeId: initialData.employeeId ?? "",
        managerId: initialData.managerId ?? "",
        cycleId: initialData.cycleId ?? cycleId ?? "",
      });
    }
  }, [initialData, form, cycleId]);

  const create = useCreateMutation({
    endpoint: `/api/appraisals`,
    successMessage: "Appraisal created",
    refetchKey: "appraisal-cycle-details appraisals",
  });

  const update = useUpdateMutation({
    endpoint: `/api/appraisals/${initialData?.id}`,
    successMessage: "Appraisal updated",
    refetchKey: "appraisal-cycle-details appraisals",
  });

  const onSubmit = async (data: AppraisalInput) => {
    if (isEditing) {
      await update(data);
    } else {
      await create(data);
    }
    setOpen(false);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={isEditing ? "Edit Appraisal" : "Create Appraisal"}
      confirmText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4 min-h-[200px]">
          <EmployeeSingleSelect
            name="employeeId"
            placeholder="Select employee"
            className="z-50"
          />

          {!cycleId && (
            <FormField
              control={form.control}
              name="cycleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Cycle</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </Modal>
  );
}
