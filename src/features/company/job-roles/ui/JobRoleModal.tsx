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
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { Textarea } from "@/shared/ui/textarea";
import { jobRoleSchema } from "../schema/job-role.schema";

interface JobRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  id?: string;
  name?: string;
  description?: string;
  level?: string;
}

export default function JobRoleModal({
  isOpen,
  onClose,
  isEditing = false,
  id,
  name,
  description,
  level,
}: JobRoleModalProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof jobRoleSchema>>({
    resolver: zodResolver(jobRoleSchema),
    defaultValues: {
      title: name || "",
      level: ["entry", "junior", "mid", "senior", "lead"].includes(level || "")
        ? (level as "entry" | "junior" | "mid" | "senior" | "lead")
        : undefined,
      description: description || "",
    },
  });

  const createJobRole = useCreateMutation({
    endpoint: "/api/job-roles",
    successMessage: "Job role created successfully",
    refetchKey: "job-roles company-elements onboarding",
  });

  const updateJobRole = useUpdateMutation({
    endpoint: `/api/job-roles/${id}`,
    successMessage: "Job role updated successfully",
    refetchKey: "job-roles",
  });

  const onSubmit = async (values: z.infer<typeof jobRoleSchema>) => {
    if (isEditing && id) {
      await updateJobRole(values, setError, onClose);
    } else {
      await createJobRole(values, setError, form.reset, onClose);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Job Role" : "Add Job Role"}
      confirmText={isEditing ? "Update" : "Add"}
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-6">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Operations Manager" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="level"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Entry", "Junior", "Mid", "Senior", "Lead"].map((lvl) => (
                      <SelectItem key={lvl} value={lvl.toLowerCase()}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Optimize business processes..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && <FormError message={error} />}
    </Modal>
  );
}
