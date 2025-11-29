/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploader } from "@/components/common/FileUploader";
import FormError from "@/components/ui/form-error";

function generateSchema(fields: any[], questions: any[]) {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    if (!field.isVisible) return;

    let base;
    if (field.fieldType === "date") {
      base = z.coerce.date();
      if (!field.required) base = base.optional();
    } else if (field.fieldType === "file") {
      base = z
        .object({
          name: z.string(),
          type: z.string(),
          base64: z.string(),
        })
        .nullable();

      if (!field.required) base = base.optional();
    } else {
      base = field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string().optional();
    }

    shape[field.id] = base;
  });

  questions.forEach((q) => {
    shape[q.id] = q.required
      ? z.string().min(1, `${q.question} is required`)
      : z.string().optional();
  });

  return z.object(shape);
}

type Props = {
  data: {
    fields: any[];
    questions: any[];
  };
  onSubmit: (values: any) => void;
  error?: string | null;
};

const sectionsOrder = [
  "personal",
  "education",
  "experience",
  "documents",
  "custom",
];

export function ApplicationForm({ data, onSubmit, error }: Props) {
  const schema = generateSchema(data.fields, data.questions);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const { handleSubmit, control } = form;

  const renderField = (field: any) => {
    const id = field.id;

    return (
      <FormField
        key={id}
        control={control}
        name={id}
        render={({ field: rhfField }) => (
          <FormItem>
            <FormLabel required>
              {field.label === "Skills"
                ? "Skills (enter multiple skills separated by commas)"
                : field.label === "Resume/CV"
                ? "Resume/CV (PDF only)"
                : field.label === "Cover Letter"
                ? "Cover Letter (PDF only, optional)"
                : field.label}
            </FormLabel>
            <FormControl>
              {field.fieldType === "textarea" ? (
                <Textarea {...rhfField} />
              ) : field.fieldType === "date" ? (
                <Input
                  type="date"
                  value={
                    rhfField.value instanceof Date
                      ? rhfField.value.toISOString().split("T")[0]
                      : rhfField.value || ""
                  }
                  onChange={(e) => rhfField.onChange(e.target.value)}
                />
              ) : field.fieldType === "file" ? (
                <FileUploader
                  value={rhfField.value}
                  onChange={rhfField.onChange}
                  accept={
                    field.accept || {
                      "application/pdf": [".pdf"],
                    }
                  }
                />
              ) : (
                <Input {...rhfField} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderQuestion = (question: any) => {
    const id = question.id;

    return (
      <FormField
        key={id}
        control={control}
        name={id}
        render={({ field: rhfField }) => (
          <FormItem>
            <FormLabel required>{question.question}</FormLabel>
            <FormControl>
              <Input {...rhfField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderSection = (section: string) => {
    const fields = data.fields
      .filter((f) => f.section === section && f.isVisible)
      .sort((a, b) => a.order - b.order);

    if (!fields.length) return null;

    return (
      <div key={section} className="space-y-4">
        <h3 className="text-lg font-semibold capitalize">
          {section} Information
        </h3>
        <Separator />
        {fields.map(renderField)}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {sectionsOrder.map(renderSection)}

        {data.questions?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Questions</h3>
            <Separator />
            {data.questions
              .sort((a, b) => a.order - b.order)
              .map(renderQuestion)}
          </div>
        )}

        {error && <FormError message={error} className="mt-4" />}

        <Button type="submit">Submit Application</Button>
      </form>
    </Form>
  );
}
