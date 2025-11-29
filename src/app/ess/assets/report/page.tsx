"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/ess/FileUploadField"; // base-64 helper built earlier
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import Loading from "@/components/ui/loading";
import PageHeader from "@/components/pageHeader";
import NavBackButton from "@/components/ess/navigation/NavBackButton";

const reportTypes = ["Lost", "Damaged", "Replacement", "Other"] as const;

/* ───── Zod schema ───── */
const ReportSchema = z.object({
  reportType: z.enum(reportTypes),
  description: z.string().min(5, "Description is required"),
  document: z.string().nullable().optional(), // base64 image or pdf
});
type ReportValues = z.infer<typeof ReportSchema>;

export default function AssetReportPage() {
  const router = useRouter();
  const params = useSearchParams();
  const assetId = params.get("assetId") || "";
  const assetName = params.get("assetName") || "Unknown Asset";

  /* Form setup */
  const form = useForm<ReportValues>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      reportType: "Lost",
      description: "",
      document: null,
    },
  });

  const createReport = useCreateMutation({
    endpoint: "/api/asset-reports",
    successMessage: "Asset report submitted",
    refetchKey: "assets",
    onSuccess: () => router.push("/dashboard/assets"),
  });

  const { data: session } = useSession();
  if (!session) return <Loading />;

  const onSubmit = async (values: ReportValues) => {
    await createReport(
      {
        employeeId: session.user.id,
        assetId,
        ...values,
        documentUrl: values.document ?? "",
      },
      () => null
    );
  };

  return (
    <div className="max-w-xl">
      <NavBackButton href="/ess/assets">Back to Assets</NavBackButton>
      <PageHeader
        title="Asset Report"
        description="Report issues with your assets such as loss, damage, or replacement needs."
        icon="📝"
      />
      <div className="my-6">
        <div>
          <h3 className="text-lg font-semibold">Report Issue – {assetName}</h3>
        </div>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              encType="multipart/form-data"
            >
              {/* 🏷 Report type */}
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 📝 Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Describe the issue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 📎 Evidence upload */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Photo / Scan (optional)</FormLabel>
                    <FormControl>
                      <FileUploadField
                        value={field.value ?? null}
                        onChange={(base64) => field.onChange(base64)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting…" : "Submit Report"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
