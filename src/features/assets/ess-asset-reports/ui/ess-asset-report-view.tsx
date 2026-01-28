"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { FileUploadField } from "@/features/ess-layout/ui/FileUploadField";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import NavBackButton from "@/features/ess-layout/ui/NavBackButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { reportTypes } from "../config/asset-report.options";
import {
  assetReportSchema,
  type AssetReportSchema,
} from "../schema/asset-report.schema";
import { useCreateAssetReport } from "../hooks/use-create-asset-report";

export function EssAssetReportView() {
  const params = useSearchParams();
  const assetId = params.get("assetId") || "";
  const assetName = params.get("assetName") || "Unknown Asset";

  const { data: session } = useSession();
  const { createAssetReport } = useCreateAssetReport();

  const form = useForm<AssetReportSchema>({
    resolver: zodResolver(assetReportSchema),
    defaultValues: {
      reportType: "Lost",
      description: "",
      document: null,
    },
  });

  if (!session) return <Loading />;

  const onSubmit = async (values: AssetReportSchema) => {
    await createAssetReport(
      {
        employeeId: session.user.id,
        assetId,
        ...values,
        documentUrl: values.document ?? "",
      },
      () => null,
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
        <h3 className="text-lg font-semibold">Report Issue – {assetName}</h3>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              encType="multipart/form-data"
            >
              {/* Report type */}
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

              {/* Description */}
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

              {/* Evidence upload */}
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
