"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch"; // Add this import
import Modal from "@/components/ui/modal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { Competency } from "@/types/performance/question-competency.type";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  type: z
    .enum(["text", "dropdown", "rating", "yes_no", "checkbox"])
    .default("text"),
  competencyId: z.string().uuid().optional(),
  isMandatory: z.boolean().optional(),
  allowNotes: z.boolean().optional(),
});

type QuestionInput = z.infer<typeof questionSchema>;

interface QuestionModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  initialData?: QuestionInput & { id: string };
}

export default function QuestionModal({
  open,
  setOpen,
  initialData,
}: QuestionModalProps) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const form = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      type: "text",
      isMandatory: false,
      allowNotes: false,
    },
  });

  // Populate form for edit
  useEffect(() => {
    if (initialData) {
      form.reset({
        question: initialData.question,
        type: initialData.type,
        competencyId: initialData.competencyId || "",
        isMandatory: initialData.isMandatory || false,
        allowNotes: initialData.allowNotes || false,
      });
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/performance-seed/question",
    successMessage: "Question created",
    refetchKey: "competencies template-questions",
  });

  const update = useUpdateMutation({
    endpoint: `/api/performance-seed/question/${initialData?.id}`,
    successMessage: "Question updated",
    refetchKey: "competencies template-questions",
  });

  const onSubmit = async (data: QuestionInput) => {
    if (initialData) {
      await update(data);
    } else {
      await create(data);
    }
    setOpen(false);
    form.reset();
  };

  const {
    data: competencies,
    isLoading,
    isError,
  } = useQuery<Competency[]>({
    queryKey: ["feedback-competencies"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-seed/only-competencies");
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading questions.</p>;

  const inputTypes = [
    { label: "Text", value: "text" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Rating", value: "rating" },
    { label: "Yes / No", value: "yes_no" },
  ];

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create Question"
      confirmText="Create"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <Label>Question</Label>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <Label>Type</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTypes.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competencyId"
            render={({ field }) => (
              <FormItem>
                <Label>Competency (optional)</Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a competency" />
                  </SelectTrigger>
                  <SelectContent>
                    {(competencies ?? []).map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isMandatory"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-4">
                  <Label className="text-lg">Is Mandatory</Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowNotes"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-6">
                  <Label className="text-lg">Allow Notes</Label>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}
