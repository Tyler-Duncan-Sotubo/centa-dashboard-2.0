"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Mustache from "mustache";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useSession } from "next-auth/react";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { FaChevronCircleLeft } from "react-icons/fa";
import Link from "next/link";
import { OFFER_LETTER_VARIABLES } from "@/shared/constants/offerLetterVariables";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import RenderHtml from "@/shared/ui/render-html";
import { buildTemplatePreviewData } from "../../offers/_components/buildTemplatePreviewData";

const templateSchema = z
  .object({
    name: z.string().min(1),
    content: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    const usedVars = Array.from(val.content.matchAll(/{{\s*(.*?)\s*}}/g)).map(
      ([, varName]) => varName,
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

export default function OfferTemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "raw">(
    "create",
  );

  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", content: "" },
  });

  const content = form.watch("content");
  const previewHtml = (() => {
    try {
      const data = buildTemplatePreviewData(content);
      return Mustache.render(content, data);
    } catch {
      return "<p class='text-red-500'>Template syntax error</p>";
    }
  })();

  const insertVariable = (varName: string) => {
    const curr = form.getValues("content") ?? "";
    form.setValue("content", `${curr} {{${varName}}}`);
  };

  const { data: template, isLoading } = useQuery({
    queryKey: ["offer-template", templateId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/offer-letter/template/${templateId}`,
      );
      return res.data.data;
    },
    enabled: !!templateId && Boolean(session?.backendTokens?.accessToken),
  });

  useEffect(() => {
    if (template) {
      form.setValue("name", template.name);
      form.setValue("content", template.content);
    }
  }, [form, template]);

  const updateTemplate = useUpdateMutation({
    endpoint: `/api/offer-letter/template/${templateId}`,
    successMessage: "Template updated successfully",
    refetchKey: "offer-letter-templates",
    onSuccess: () => router.push("/dashboard/employees/onboarding"),
  });

  const onSubmit = async (vals: z.infer<typeof templateSchema>) => {
    await updateTemplate(vals);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="px-5">
      <Link href="/dashboard/recruitment/offer-templates">
        <Button variant={"link"} className="px-0 text-md mb-5 ">
          <FaChevronCircleLeft size={30} />
          Back to Offer Templates
        </Button>
      </Link>
      <PageHeader
        title="Edit Offer Letter Template"
        description="Update this offer letter template and preview changes."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            defaultValue="create"
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "create" | "preview" | "raw")
            }
            className="mt-5"
          >
            <TabsList>
              <TabsTrigger value="create">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw HTML</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="grid grid-cols-12 gap-6 mt-10">
                <div className="col-span-8 space-y-6">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body</FormLabel>
                        <RichTextEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4 space-y-6">
                  <div>
                    <p className="font-semibold mb-2">Insert Variable</p>
                    <Select onValueChange={insertVariable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFER_LETTER_VARIABLES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <RenderHtml html={previewHtml} />
            </TabsContent>

            <TabsContent value="raw">
              <pre className="bg-muted p-4 text-xs overflow-x-auto">
                {previewHtml}
              </pre>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
