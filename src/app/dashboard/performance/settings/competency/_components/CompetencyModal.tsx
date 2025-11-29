"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

const competencySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  description: z.string().max(255, "Max 255 characters").optional(),
});

type CompetencyInput = z.infer<typeof competencySchema>;

interface CompetencyModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  initialData?: CompetencyInput & { id: string }; // optional for edit
}

export default function CompetencyModal({
  open,
  setOpen,
  initialData,
}: CompetencyModalProps) {
  const form = useForm<CompetencyInput>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Populate form for edit
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/performance-seed/competency",
    successMessage: "Competency created",
    refetchKey: "competencies",
  });

  const update = useUpdateMutation({
    endpoint: `/api/performance-seed/competency/${initialData?.id}`,
    successMessage: "Competency updated",
    refetchKey: "competencies",
  });

  const onSubmit = async (data: CompetencyInput) => {
    if (initialData) {
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
      title={initialData ? "Edit Competency" : "Create Competency"}
      confirmText={initialData ? "Update" : "Create"}
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
                <Label>Name</Label>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <Label>Description</Label>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
