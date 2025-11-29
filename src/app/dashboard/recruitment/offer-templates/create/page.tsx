"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Mustache from "mustache";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { OFFER_LETTER_VARIABLES } from "@/constants/offerLetterVariables";
import PageHeader from "@/components/pageHeader";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { formatSource } from "@/utils/formatSource";
import { CentaAISuggest } from "@/components/ui/centa-ai-suggest";
import { useRouter } from "next/navigation";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import RenderHtml from "@/components/ui/render-html";
import { buildTemplatePreviewData } from "../../offers/_components/buildTemplatePreviewData";

const templateSchema = z
  .object({
    name: z.string().min(1),
    content: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    const usedVars = Array.from(val.content.matchAll(/{{\s*(.*?)\s*}}/g)).map(
      ([, varName]) => varName
    );

    const allowed = new Set<string>(OFFER_LETTER_VARIABLES);
    const invalid = usedVars.filter((v) => !allowed.has(v));

    if (invalid.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: `Invalid variables used: ${invalid.join(", ")}`,
      });
    }
  });

export default function OfferTemplateCreate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "raw">(
    "create"
  );
  const [AiError, setAIError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", content: "" },
  });

  /* ---- variable picker ---- */
  const insertVariable = (varName: string) => {
    const curr = form.getValues("content") ?? "";
    form.setValue("content", `${curr} {{${varName}}}`);
  };

  /* ---- preview ---- */
  const content = form.watch("content");

  const previewHtml = (() => {
    try {
      const data = buildTemplatePreviewData(content);
      return Mustache.render(content, data);
    } catch {
      return "<p class='text-red-500'>Template syntax error</p>";
    }
  })();

  const handleCreateTemplate = useCreateMutation({
    endpoint: "/api/offer-letter/create-template",
    successMessage: "Template created successfully!",
    refetchKey: "offer-letter-templates",
    onSuccess: () => {
      form.reset();
      router.push("/dashboard/recruitment/offers");
    },
  });

  const onSubmit = async (vals: z.infer<typeof templateSchema>) => {
    await handleCreateTemplate(vals);
  };

  const generateTemplate = async (style: "professional" | "simple") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-offer-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });
      const { content } = await res.json();
      form.setValue("content", content);
      setAIError(null);
      setActiveTab("preview");
    } catch (error) {
      console.error("Error generating template:", error);
      form.setError("content", {
        type: "manual",
        message: "Failed to generate template. Please try again.",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-5">
      <Link href="/dashboard/recruitment/offer-templates">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft size={30} />
          Back to Offer Templates
        </Button>
      </Link>
      <PageHeader
        title="Create Offer Letter Template"
        description="Design and save reusable offer letter templates for your company."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            defaultValue="create"
            className="mt-5"
            value={activeTab}
            onValueChange={(val: string) =>
              setActiveTab(val as "create" | "preview" | "raw")
            }
          >
            <TabsList>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              {/* LEFT — editor */}
              <div className="grid grid-cols-12 gap-6 mt-10">
                <div className="col-span-8 space-y-6">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <Input
                          placeholder="e.g. Senior Engineer Offer"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Body</FormLabel>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => generateTemplate("professional")}
                            disabled={isLoading}
                          >
                            <CentaAISuggest isLoading={isLoading} />
                          </Button>
                          {AiError && (
                            <span className="text-red-500 text-sm">
                              {AiError}
                            </span>
                          )}
                        </div>
                        <RichTextEditor
                          key={form.watch("content")} // forces re-render when value changes
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* RIGHT — variable picker & actions */}
                <div className="col-span-4 space-y-6">
                  <div>
                    <p className="font-semibold mb-2">Insert Variable</p>
                    <Select onValueChange={insertVariable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose variable" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {OFFER_LETTER_VARIABLES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {formatSource(v)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* live preview */}

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={form.formState.isSubmitting}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <RenderHtml html={previewHtml} />
            </TabsContent>
            <TabsContent value="raw">
              <pre className="bg-muted p-4 overflow-x-auto text-xs h-full">
                {previewHtml}
              </pre>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
