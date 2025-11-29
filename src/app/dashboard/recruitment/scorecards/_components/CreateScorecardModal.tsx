"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Modal from "@/components/ui/modal"; // your reusable modal
import { Card } from "@/components/ui/card";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import * as z from "zod";

const scorecardTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  criteria: z
    .array(
      z.object({
        label: z.string().min(1, "Label is required"),
        description: z.string().optional(),
        maxScore: z
          .number({ invalid_type_error: "Must be a number" })
          .min(1, "Max score must be at least 1"),
      })
    )
    .min(1, "At least one criterion is required"),
});

type ScorecardTemplateInput = z.infer<typeof scorecardTemplateSchema>;

interface CreateScorecardModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const CreateScorecardModal: React.FC<CreateScorecardModalProps> = ({
  open,
  setOpen,
}) => {
  const form = useForm<ScorecardTemplateInput>({
    resolver: zodResolver(scorecardTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      criteria: [{ label: "", description: "", maxScore: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "criteria",
    control: form.control,
  });

  const createScorecard = useCreateMutation({
    endpoint: "/api/interviews/scorecards-templates",
    successMessage: "Scorecard created",
    refetchKey: "scoreCards",
  });

  const onSubmit = async (data: ScorecardTemplateInput) => {
    await createScorecard(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create Scorecard Template"
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
                <Textarea {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Criteria</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ label: "", description: "", maxScore: 5 })
              }
            >
              <FaPlus className="mr-2" />
              Add
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 space-y-3">
              <FormField
                control={form.control}
                name={`criteria.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <Label>Label</Label>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`criteria.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <Label>Description</Label>
                    <Textarea {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`criteria.${index}.maxScore`}
                render={({ field }) => (
                  <FormItem>
                    <Label>Max Score</Label>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                <FaTrash className="mr-2" />
                Remove
              </Button>
            </Card>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateScorecardModal;
