"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useState } from "react";
import { marked } from "marked";
import FormError from "@/components/ui/form-error";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import { Button } from "@/components/ui/button";

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

interface CreateEmailTemplateModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const CreateEmailTemplateModal: React.FC<CreateEmailTemplateModalProps> = ({
  open,
  setOpen,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [AiError, setAIError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EmailTemplateInput>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
    },
  });

  const createEmailTemplate = useCreateMutation({
    endpoint: "/api/interviews/email-templates",
    successMessage: "Email template created",
    refetchKey: "emailTemplates",
  });

  const onSubmit = async (data: EmailTemplateInput) => {
    await createEmailTemplate(data);
    setOpen(false);
    setError(null);
    form.reset();
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Create Email Template"
      confirmText="Create"
      cancelText="Cancel"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
      disableConfirm={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <Label>Subject</Label>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-2 flex items-center justify-between">
                  <FormLabel>Body</FormLabel>
                  {AiError && <FormError message={AiError} />}
                  <Button
                    type="button"
                    variant="link"
                    disabled={isSubmitting}
                    className="mb-3 text-xl font-semibold p-0"
                    onClick={async () => {
                      const name = form.getValues("name");
                      const subject = form.getValues("subject");

                      if (!name || !subject) {
                        setAIError("Please fill name and subject first.");
                        return;
                      }

                      setIsSubmitting(true);
                      setAIError(null);

                      const res = await fetch("/api/email-templates", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: name,
                          jobTitle: subject,
                        }),
                      });

                      const data = await res.json();
                      setIsSubmitting(false);

                      if (!res.ok) {
                        setAIError(data.error || "AI generation failed.");
                        return;
                      }

                      const htmlContent = await marked(data.body);
                      form.setValue("body", htmlContent);
                    }}
                  >
                    <CentaAISuggest isLoading={isSubmitting} />
                  </Button>
                </div>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  key={field.value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
      {error && <FormError message={error} />}
    </Modal>
  );
};

export default CreateEmailTemplateModal;
