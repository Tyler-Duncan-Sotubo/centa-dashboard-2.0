"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Form, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { DateInput } from "@/shared/ui/date-input";
import { useEffect } from "react";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";

const schema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

type CycleInput = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: Partial<CycleInput> & { id?: string };
}

export default function CreateCycleModal({
  open,
  setOpen,
  initialData,
}: Props) {
  const isEditing = !!initialData?.id;

  const form = useForm<CycleInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: initialData?.name ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
    });
  }, [open, initialData, form]);

  const createCycle = useCreateMutation({
    endpoint: "/api/performance-cycle",
    successMessage: "Cycle created",
    refetchKey: "performance-cycles current-cycle",
  });

  const updateCycle = useUpdateMutation({
    endpoint: `/api/performance-cycle/${initialData?.id}`,
    successMessage: "Cycle updated",
    refetchKey: "performance-cycles current-cycle",
  });

  const onSubmit = async (data: CycleInput) => {
    if (isEditing) {
      await updateCycle(data);
    } else {
      await createCycle(data);
    }
    setOpen(false);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={isEditing ? "Edit Performance Cycle" : "Create Performance Cycle"}
      confirmText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <label>Name</label>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <label>Start Date</label>
                <DateInput value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <label>End Date</label>
                <DateInput value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
