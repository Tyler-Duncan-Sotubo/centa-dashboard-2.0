"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/modal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { DateInput } from "@/components/ui/date-input";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppraisalCycle } from "@/types/performance/appraisal.type";

const schema = z.object({
  name: z.string().min(1, "Cycle name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["upcoming", "active", "closed"]),
});

type AppraisalCycleInput = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  initialData?: AppraisalCycle | null;
}

export default function AppraisalCycleModal({
  open,
  setOpen,
  initialData,
}: Props) {
  const isEditing = !!initialData?.id;

  const form = useForm<AppraisalCycleInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
      status: initialData?.status ?? "upcoming",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        startDate: initialData.startDate ?? "",
        endDate: initialData.endDate ?? "",
        status: initialData.status ?? "upcoming",
      });
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/appraisals/cycle",
    successMessage: "Appraisal cycle created",
    refetchKey: "appraisal-cycles",
  });

  const update = useUpdateMutation({
    endpoint: `/api/appraisals/cycle/${initialData?.id}`,
    successMessage: "Appraisal cycle updated",
    refetchKey: "appraisal-cycles",
  });

  const onSubmit = async (data: AppraisalCycleInput) => {
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
      title={isEditing ? "Edit Appraisal Cycle" : "Create Appraisal Cycle"}
      confirmText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
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
                <FormLabel required>Start Date</FormLabel>
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
                <FormLabel required>End Date</FormLabel>
                <DateInput value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
