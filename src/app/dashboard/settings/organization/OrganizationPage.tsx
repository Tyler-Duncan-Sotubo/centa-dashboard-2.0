"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import FormError from "@/shared/ui/form-error";
import { UploadCloud } from "lucide-react";
import { Company } from "@/types/company.type";
import Image from "next/image";
import { OnboardingSchema } from "@/schema/onboarding.schema";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import PageHeader from "@/shared/ui/page-header";
import { FaBuilding } from "react-icons/fa";

function Onboarding({ company }: { company: Company }) {
  const [error, setError] = useState<string | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      logo_url: "",
      name: "",
      country: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      regNo: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (company) {
      form.reset({
        logo_url: company.logo_url || "",
        name: company.name || "",
        country: company.country || "",
        primaryContactName: company.primaryContactName || "",
        primaryContactEmail: company.primaryContactEmail || "",
        primaryContactPhone: company.primaryContactPhone || "",
        regNo: company.regNo || "",
      });
    }
  }, [company, form, form.reset]);

  // Handle File Upload
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedLogo(reader.result as string);
        form.setValue("logo_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const updateCompany = useUpdateMutation({
    endpoint: "/api/company",
    successMessage: "Company updated successfully",
    refetchKey: "company, onboarding",
  });

  async function onSubmit(values: z.infer<typeof OnboardingSchema>) {
    await updateCompany(values, setError, form.reset);
  }

  return (
    <section>
      <div className="mb-6">
        <PageHeader
          title="Company Information"
          description="Update your company information to keep your account up to date."
          icon={<FaBuilding size={20} />}
          tooltip="Company information is used for all official documents and tax forms."
        />
      </div>
      <div className="w-full max-w-2xl space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="flex flex-row items-center gap-6">
              {/* Image Upload Section */}
              <div
                {...getRootProps()}
                className="border-dashed border-2 border-gray-300 p-10 rounded-lg cursor-pointer hover:border-primary w-1/3 flex flex-col items-center"
              >
                <input {...getInputProps()} />
                {uploadedLogo || form.getValues("logo_url") ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={uploadedLogo || form.getValues("logo_url") || ""}
                      alt="Company Logo"
                      className="rounded-lg"
                      fill
                    />
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary">Drop the file here...</p>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UploadCloud size={48} />
                    <p className="text-center">
                      Drag & drop a logo, or click to select one
                    </p>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="w-1/2 flex flex-col justify-start space-y-4">
                <h2 className="text-xl font-semibold">Company Logo</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your company logo to personalize your account.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This logo will appear on all paystubs and company emails.
                </p>
              </div>
            </div>

            {/* Company Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Registration Number</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Enter your company registration number. This will be used
                    for all tax forms and official documents. CAC or IRS number
                    is recommended.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      disabled
                      className="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Zone */}

            <div className="space-y-4">
              {/* Company Contact Section */}
              <h2 className="text-lg font-semibold mb-2">Company Contact</h2>

              <FormField
                control={form.control}
                name="primaryContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Primary Contact Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                This contact will receive all official company communications,
                including tax forms and important updates.
              </p>
              {/* Email */}
              <FormField
                control={form.control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} required />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      This email will be used for all official company
                      communications.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="primaryContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Primary Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        placeholder="+1 555-555-5555"
                        pattern="^\+?[1-9]\d{1,14}$"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <FormError message={error} />}
            <Button
              type="submit"
              className="w-1/4"
              isLoading={form.formState.isSubmitting}
            >
              Save
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}

export default Onboarding;
