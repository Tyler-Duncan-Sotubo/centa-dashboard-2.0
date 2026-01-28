"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";
import { useRouter } from "next/navigation";
import { IoLogOutOutline } from "react-icons/io5";

import { Form, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";
import { format, parseISO } from "date-fns";
import { Separator } from "@/shared/ui/separator";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

// -------- Types
type ConfigItem = { id: string; name: string };

const detailsSchema = z.object({
  checklistItemIds: z
    .array(z.string())
    .min(1, "Select at least one checklist item"),
  notes: z.string().optional(),
  confirmTermination: z.literal(true, {
    errorMap: () => ({ message: "You must confirm termination to proceed" }),
  }),
});
type DetailsForm = z.infer<typeof detailsSchema>;

type SessionResponse = {
  id: string;
  employeeId: string;
  employeeName: string | null;
  terminationType: string;
  terminationReason: string;
  terminationDate: string;
  eligibleForRehire: boolean;
  checklistItems: { id: string; name: string; description?: string }[];
};

const ContinueOffboardingPage = () => {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const router = useRouter();
  const axiosInstance = useAxiosAuth();
  const { data: sessionAuth, status } = useSession();

  const [error] = useState("");

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      checklistItemIds: [],
      notes: "",
      confirmTermination: true,
    },
  });

  // Fetch config
  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useQuery({
    queryKey: ["offboarding-config"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/offboarding-config");
      return res.data.data as {
        types: ConfigItem[];
        reasons: ConfigItem[];
        checklist: ConfigItem[];
      };
    },
    enabled: !!sessionAuth?.backendTokens?.accessToken,
  });

  // Fetch session
  const {
    data: sessionInfo,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ["offboarding-session-by-employee", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const res = await axiosInstance.get(
        `/api/offboarding/employee/${employeeId}`,
      );
      return res.data.data as SessionResponse;
    },
    enabled: !!sessionAuth?.backendTokens?.accessToken && !!employeeId,
  });

  const cancelOffboarding = useCreateMutation({
    endpoint: `/api/offboarding/${sessionInfo?.id}/cancel`,
    successMessage: "Offboarding session cancelled",
    onSuccess: () => {
      router.push(`/dashboard/employees/offboarding`);
    },
  });

  const submitChecklist = useCreateMutation({
    endpoint: `/api/offboarding/${sessionInfo?.id}/details`,
    successMessage: "Termination Process Has Started",
    onSuccess: () => {
      router.push(`/dashboard/employees/offboarding`);
      form.reset();
    },
  });

  const onSubmit = (values: DetailsForm) => {
    submitChecklist(values);
  };

  const onCancel = () => {
    if (!sessionInfo?.id) return;
    cancelOffboarding({});
  };

  const isBusy = status === "loading" || configLoading || sessionLoading;

  if (!employeeId)
    return <p className="text-red-600 p-6">Missing employeeId in URL.</p>;
  if (isBusy) return <Loading />;
  if (configError || !config)
    return <p className="text-red-600 p-6">Error loading configuration.</p>;
  if (sessionError || !sessionInfo)
    return (
      <p className="text-red-600 p-6">
        No offboarding session found for this employee.
      </p>
    );

  const prettyDate = sessionInfo.terminationDate
    ? format(parseISO(sessionInfo.terminationDate), "MMMM do, yyyy")
    : "";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Continue Offboarding</h1>
        <p className="text-muted-foreground mt-2">
          Proceed with termination for{" "}
          <span className="font-semibold text-brandDark">
            {sessionInfo.employeeName || sessionInfo.employeeId}
          </span>
          ? Employee will not have access to their ESS portal past the
          termination date.
        </p>
      </div>

      {/* Read-only details */}
      <div className="grid grid-cols-5 gap-4 rounded border p-8 text-center shadow-md">
        <div>
          <div className="text-xs uppercase text-muted-foreground">
            Employee
          </div>
          <div className="mt-1 font-medium">
            {sessionInfo.employeeName || sessionInfo.employeeId}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground">
            Termination Type
          </div>
          <div className="mt-1">{sessionInfo.terminationType}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground">Reason</div>
          <div className="mt-1">{sessionInfo.terminationReason}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground">
            Termination Date
          </div>
          <div className="mt-1">{prettyDate}</div>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground">
            Eligible for Rehire
          </div>
          <div className="mt-1">
            {sessionInfo.eligibleForRehire ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="checklistItemIds"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <h2 className="text-2xl font-semibold">
                  Termination Checklist
                </h2>
                <Separator className="my-2" />
                <div className="grid gap-3">
                  {config.checklist.map(
                    (item: {
                      id: string;
                      name: string;
                      description?: string;
                    }) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 text-lg"
                      >
                        <Checkbox
                          checked={field.value.includes(item.id)}
                          onCheckedChange={(checked) => {
                            const newVal =
                              checked === true
                                ? [...field.value, item.id]
                                : field.value.filter((v) => v !== item.id);
                            field.onChange(newVal);
                          }}
                        />
                        <div className="flex items-center justify-between w-full max-w-3xl">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-sm text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ),
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="notes"
            control={form.control}
            render={({ field }) => (
              <FormItem className="mt-12">
                <h2 className="text-2xl font-semibold">Termination Note</h2>
                <Separator className="my-2" />
                <textarea
                  {...field}
                  className="w-full p-2 border rounded resize-none h-40"
                  placeholder="Add a note for this termination (optional)"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="confirmTermination"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    id="confirm-termination"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === false)
                    }
                  />
                  <label
                    htmlFor="confirm-termination"
                    className="text-xl leading-none select-none font-medium"
                  >
                    I confirm that I want to proceed with this termination.
                  </label>
                </div>
                <FormMessage /> {/* 👈 This will show the Zod error */}
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-between gap-2 mt-10">
            <Button type="button" variant="destructive" onClick={onCancel}>
              <MdCancel /> Cancel Termination
            </Button>

            <div className="space-x-6">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(onSubmit)}
              >
                <FaArrowAltCircleRight />
                Continue Later
              </Button>

              <Button type="submit">
                <IoLogOutOutline className="mr-2" />
                Terminate Employee
              </Button>
            </div>
          </div>
        </form>

        {error && <FormError message={error} />}
      </Form>
    </div>
  );
};

export default ContinueOffboardingPage;
