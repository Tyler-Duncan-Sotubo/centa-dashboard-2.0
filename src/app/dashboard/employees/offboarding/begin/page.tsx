"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import PageHeader from "@/shared/ui/page-header";
import { FaArrowRight } from "react-icons/fa6";
import { DateInput } from "@/shared/ui/date-input";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input";

// --- Types ---
type Items = {
  id: string;
  name: string;
};

// --- Validation (BEGIN payload only) ---

const offboardingBeginSchema = z.object({
  terminationType: z.string().min(1, "Termination type is required"),
  terminationReason: z.string().min(1, "Termination reason is required"),
  terminationDate: z.string().min(1, "Termination date is required"), // yyyy-mm-dd
  eligibleForRehire: z.boolean().default(true),
});

// --- Component ---

const BeginOffboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const employeeName = searchParams.get("employeeName"); // from URL

  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof offboardingBeginSchema>>({
    resolver: zodResolver(offboardingBeginSchema),
    defaultValues: {
      terminationType: "",
      terminationReason: "",
      terminationDate: "",
      eligibleForRehire: true,
    },
  });

  // NOTE: point to your new 'begin' endpoint
  const createSession = useCreateMutation({
    endpoint: "/api/offboarding/begin",
    successMessage: "Offboarding session started",
    refetchKey: "offboarding-sessions",
    onSuccess: () => {
      form.reset();
      router.push(
        `/dashboard/employees/offboarding/continue?employeeId=${employeeId}`,
      );
    },
    onError: () => {
      form.reset();
      setError("");
    },
  });

  const onSubmit = async (values: z.infer<typeof offboardingBeginSchema>) => {
    if (!employeeId) return setError("Missing employeeId in URL query.");
    await createSession(
      {
        ...values,
        employeeId,
      },
      setError,
    );
  };

  // Config still needed for types & reasons
  const fetchConfig = async () => {
    try {
      const res = await axiosInstance.get("/api/offboarding-config");
      return res.data.data as {
        types: Items[];
        reasons: Items[];
      };
    } catch (error) {
      if (isAxiosError(error) && error.response) return null;
      throw error;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["offboarding-config"],
    queryFn: fetchConfig,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError || !data)
    return (
      <p className="text-red-600">Error loading offboarding configuration.</p>
    );

  return (
    <div className="p-6">
      <PageHeader title="Begin Offboarding" />
      <div className="mb-6">
        <h2 className="text-xl text-muted-foreground mt-2">
          Proceed with termination for{" "}
          <span className="font-semibold text-brandDark">{employeeName}</span> ?
          Employee will not have access to their ESS portal past the termination
          date.
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-2xl"
        >
          <FormField
            name="terminationType"
            control={form.control}
            render={() => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Input type="text" value={employeeName || ""} disabled />
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Termination Type */}
          <FormField
            name="terminationType"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termination Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.types.map((type: Items) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reason */}
          <FormField
            name="terminationReason"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.reasons.map((reason: Items) => (
                      <SelectItem key={reason.id} value={reason.id}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Termination Date */}
          <FormField
            name="terminationDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termination Date</FormLabel>
                <FormControl>
                  <DateInput
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Eligible For Rehire */}
          <FormField
            name="eligibleForRehire"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eligible for Rehire</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value?.toString()} // convert boolean -> string for the Select
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select eligibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-10" />

          <div className="flex justify-end gap-2 mt-44">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-48">
              <FaArrowRight /> Continue
            </Button>
          </div>
        </form>
        {error && <FormError message={error} />}
      </Form>
    </div>
  );
};

export default BeginOffboarding;
