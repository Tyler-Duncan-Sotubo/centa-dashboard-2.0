"use client";

import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Modal from "@/components/ui/modal";

import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";

const feedbackQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  inputType: z.enum(["text", "rating", "yes_no", "dropdown", "checkbox"]),
});

type FeedbackQuestionInput = z.infer<typeof feedbackQuestionSchema>;

interface FeedbackQuestionModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  initialData?: FeedbackQuestionInput & { id: string }; // id only for edit
  selectedType: string | null; // to set type when creating new question
  order?: number; // optional order for new question
}

const inputTypeOptions = [
  { value: "text", label: "Text" },
  { value: "rating", label: "Rating" },
  { value: "yes_no", label: "Yes / No" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

export default function FeedbackQuestionModal({
  open,
  setOpen,
  initialData,
  selectedType,
  order = 0, // default order for new questions
}: FeedbackQuestionModalProps) {
  const form = useForm<FeedbackQuestionInput>({
    resolver: zodResolver(feedbackQuestionSchema),
    defaultValues: {
      question: "",
      inputType: "text",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        question: initialData.question,
        inputType: initialData.inputType,
      });
    }
  }, [initialData, form]);

  const create = useCreateMutation({
    endpoint: "/api/feedback-questions",
    successMessage: "Question created",
    refetchKey: "feedback-questions",
  });

  const update = useUpdateMutation({
    endpoint: `/api/feedback-questions/${initialData?.id}`,
    successMessage: "Question updated",
    refetchKey: "feedback-questions",
  });

  const onSubmit = async (data: FeedbackQuestionInput) => {
    if (initialData) {
      await update(data);
    } else {
      await create({
        ...data,
        type: selectedType, // set type when creating new question
        order, // set order when creating new question
      });
    }
    setOpen(false);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={
        initialData ? "Edit Feedback Question" : "Create Feedback Question"
      }
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
            name="inputType"
            render={({ field }) => (
              <FormItem>
                <Label>Input Type</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Input Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTypeOptions.map((opt) => (
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
        </div>
      </Form>
    </Modal>
  );
}
