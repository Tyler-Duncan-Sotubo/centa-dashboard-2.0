"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/shared/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useState } from "react";
import FormError from "@/shared/ui/form-error";

const formSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  stages: z
    .array(
      z.object({
        value: z.string().min(1, "Stage name is required"),
      }),
    )
    .min(1, "At least one stage is required")
    .max(20, "Maximum 20 stages allowed"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePipelineTemplateModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      stages: [{ value: "" }],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    register,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stages",
  });

  const createTemplate = useCreateMutation({
    endpoint: "/api/pipeline/template",
    successMessage: "Template created successfully",
    onSuccess: () => {
      setOpen(false);
      setError("");
    },
    refetchKey: "pipelineTemplates",
  });

  const onSubmit = async (data: FormValues) => {
    const formattedData = {
      ...data,
      stages: data.stages.map((stage) => stage.value),
    };
    await createTemplate(formattedData, setError, form.reset);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Pipeline Template</DialogTitle>
          <DialogDescription>
            Name your template and define its stages.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sales Hiring" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this template..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Stages</FormLabel>
              <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      {...register(`stages.${index}.value`)}
                      placeholder={`Stage ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ value: "" })}
                  className="mt-2"
                >
                  + Add Stage
                </Button>
              </div>
            </div>

            {error && <FormError message={error} />}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Template
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
