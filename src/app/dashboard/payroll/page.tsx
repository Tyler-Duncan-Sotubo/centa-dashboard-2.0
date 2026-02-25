"use client";

import React, { useEffect, useState } from "react";
import Loading from "@/shared/ui/loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import PageHeader from "@/shared/ui/page-header";
import {
  Banknote,
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { PayslipTable } from "@/features/payroll/core/ui/payslip.table";
import { EmployeeDetail } from "@/types/payRunDetails";
import { SendPayrollForApproval } from "./_components/SendPayrollForApproval";
import PaySummary from "./_components/PaySummary";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { FinalPayRunTable } from "./_components/FinalPayrunTable";
import { PayrollHistory } from "./_components/PayrollHistory";
import { MdOutlineSync } from "react-icons/md";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { FaTrash } from "react-icons/fa6";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { ClientGuard } from "@/lib/guard/ClientGuard";

const steps = [
  { label: "Start", icon: <CalendarIcon className="h-5 w-5" /> },
  { label: "Review", icon: <FileText className="h-5 w-5" /> },
  { label: "Pay", icon: <Banknote className="h-5 w-5" /> },
  { label: "Confirm", icon: <CheckSquare className="h-5 w-5" /> },
];

export default function Payroll() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("payrollActiveStep");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [loadingStep, setLoadingStep] = useState(false);
  const [nextPayDate, setNextPayDate] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState<EmployeeDetail[]>([]);
  const [payrollRunId, setPayrollRunId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("payrollRunId");
  });
  const [finalRunId, setFinalRunId] = useState<string | null>(null);

  const [isLoadingReSync, setIsLoadingReSync] = React.useState(false);

  useEffect(() => {
    if (!payrollRunId) return;
    const sentAlready =
      localStorage.getItem(`payrollSent:${payrollRunId}`) === "true";
    setActiveStep(sentAlready ? 2 : 1);
  }, [payrollRunId]);

  const fetchNextPayDate = async () => {
    try {
      const res = await axiosInstance.get("/api/pay-schedules/next-pay-date");
      const raw = res.data.data as string | null | undefined;
      const dateOnly = raw ? raw.slice(0, 10) : "";
      return dateOnly;
    } catch (error) {
      if (isAxiosError(error) && error.response) return "";
      return "";
    }
  };

  const fetchApprovalStatus = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/payroll/approval-status/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return "";
      return "";
    }
  };

  const fetchPayrollSummary = async (id: string) => {
    const res = await axiosInstance.get(`/api/payroll/${id}/summary`);
    return res.data.data as EmployeeDetail[];
  };

  // ✅ CHANGE: keep refetch handle
  const {
    data: fetchedSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["payrollSummary", payrollRunId],
    enabled: !!payrollRunId && !!session?.backendTokens?.accessToken,
    queryFn: () => fetchPayrollSummary(payrollRunId as string),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const { data: finalSummary, isLoading: isFinalSummaryLoading } = useQuery({
    queryKey: ["finalSummary", finalRunId],
    enabled:
      activeStep === 4 && !!finalRunId && !!session?.backendTokens?.accessToken,
    queryFn: () => fetchPayrollSummary(finalRunId as string),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchedSummary) {
      setPayrollSummary(
        fetchedSummary.map((r) => ({ ...r, isLeaver: r.isLeaver ?? false })),
      );
    }
  }, [fetchedSummary]);

  const { data, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["payrollStatus", payrollRunId],
    queryFn: async () => {
      if (!payrollRunId || !session?.backendTokens?.accessToken) return null;
      const statusData = await fetchApprovalStatus(payrollRunId);
      if (statusData?.approvalStatus === "approved" && activeStep === 2) {
        setActiveStep(3);
      }
      return statusData;
    },
    refetchInterval: activeStep === 2 ? 5000 : false,
    enabled: !!payrollRunId && !!session?.backendTokens?.accessToken,
  });

  const { isLoading, isError } = useQuery({
    queryKey: ["nextPayDate"],
    queryFn: async () => {
      const dateOnly = await fetchNextPayDate();
      setNextPayDate(dateOnly);
      return dateOnly;
    },
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const createPayroll = useCreateMutation({
    endpoint: `/api/payroll/calculate-payroll-for-company/${nextPayDate}`,
    successMessage: "Payroll created successfully",
    refetchKey: "payroll pay-date",
    onSuccess: (created) => {
      const { data } = created as {
        data: {
          payrollRunId: string;
          payrollDate: string;
          employeeCount?: number;
        };
      };
      if (data?.payrollRunId) {
        localStorage.setItem("payrollRunId", data.payrollRunId);
        setPayrollRunId(data.payrollRunId);
      }
      setActiveStep(1);
    },
    onError: (error) => console.error(error),
  });

  const completePayRun = useUpdateMutation({
    endpoint: `/api/payroll/${payrollRunId}/payment-in-progress`,
    successMessage: "Payroll completed successfully",
    refetchKey: "payroll pay-date",
    onSuccess: () => {
      setFinalRunId(payrollRunId);

      if (payrollRunId) {
        localStorage.removeItem("payrollRunId");
        localStorage.removeItem(`payrollSent:${payrollRunId}`);
      }

      setPayrollRunId(null);
      setActiveStep(4);
    },
    onError: (error) => console.error(error),
  });

  const reSyncPayroll = useCreateMutation({
    endpoint: `/api/payroll/calculate-payroll-for-company/${payrollSummary[0]?.payrollDate}?includeLeavers=true`,
    successMessage: "Payroll synced successfully",
    refetchKey: "payroll pay-date",
    onSuccess: async (created) => {
      const { data } = created as {
        data: { payrollRunId?: string } | EmployeeDetail[];
      };

      const newId = Array.isArray(data)
        ? data?.[0]?.payrollRunId
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any)?.payrollRunId;

      if (newId && newId !== payrollRunId) {
        localStorage.setItem("payrollRunId", newId);
        setPayrollRunId(newId);
      }

      // ✅ CHANGE: force refetch of summary after sync (covers both same-id & new-id)
      await queryClient.invalidateQueries({ queryKey: ["payrollSummary"] });
      await refetchSummary();
    },
    onError: (error) => console.error(error),
  });

  const discardPayrun = useDeleteMutation({
    endpoint: `/api/payroll/${payrollRunId}/discard`,
    successMessage: "Payroll run discarded successfully",
    onSuccess: () => {
      if (payrollRunId) {
        localStorage.removeItem("payrollRunId");
        localStorage.removeItem(`payrollSent:${payrollRunId}`);
      }
      localStorage.removeItem("payrollActiveStep");
      setFinalRunId(null);
      setPayrollRunId(null);
      setPayrollSummary([]);
      setActiveStep(0);
    },
  });

  // ✅ CHANGE: always refetch summary after resync
  const handleResync = async () => {
    setIsLoadingReSync(true);
    await reSyncPayroll();
    await refetchSummary();
    setIsLoadingReSync(false);
  };

  if (status === "loading" || isLoading || isLoadingStatus || isSummaryLoading)
    return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const stepActions: Array<() => Promise<void>> = [
    async () => {
      setLoadingStep(true);
      await createPayroll();
      setLoadingStep(false);
    },
    async () => {
      setActiveStep(2);
    },
    async () => console.log("Triggering payment…"),
    async () => {
      setLoadingStep(true);
      await completePayRun();
      setLoadingStep(false);
    },
  ];

  const handleNext = async () => {
    try {
      await stepActions[activeStep]();
    } catch (err) {
      console.error(err);
    }
  };

  const isStepDisabled = [0, 1, 3, 4].includes(activeStep) || loadingStep;

  const employeesOnPayroll = payrollSummary.filter(
    (e) => !(e.isStarter ?? false) && !(e.isLeaver ?? false),
  );

  const startersOnPayroll = payrollSummary.filter(
    (e) => (e.isStarter ?? false) && !(e.isLeaver ?? false),
  );

  const leaversOnPayroll = payrollSummary.filter((e) => e.isLeaver ?? false);

  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <div className="px-6">
        <div className="">
          <PageHeader
            title="Preview Payroll"
            description="Add Or Update any deductions or bonuses before proceeding to payment."
          />
        </div>

        <div className="w-full mt-16 flex justify-center">
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (activeStep === 1) {
                  setPayrollSummary([]);
                  setActiveStep(0);
                } else {
                  setActiveStep((prev) => Math.max(prev - 1, 0));
                }
              }}
              disabled={isStepDisabled}
            >
              Back
            </Button>

            <div className="flex-1 flex items-center max-w-lg justify-center space-x-6 mx-4">
              {steps.map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "p-3 rounded-full border-4",
                        idx < activeStep
                          ? "border-brand bg-brand"
                          : idx === activeStep
                            ? "border-brand bg-white"
                            : "border-gray-300 bg-white",
                      )}
                    >
                      {idx < activeStep ? (
                        <Check size={25} className="text-white" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm mt-1",
                        idx <= activeStep
                          ? "text-brand"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 self-center h-1.5 mb-5 mx-1",
                        idx < activeStep ? "bg-brand" : "bg-gray-300",
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {activeStep < steps.length ? (
              <Button onClick={handleNext} isLoading={loadingStep}>
                {activeStep === 0
                  ? "Calculate Payroll"
                  : activeStep === 1
                    ? "Send for Approval"
                    : activeStep === 2
                      ? "Pay Employees"
                      : activeStep === 3
                        ? "Finish"
                        : ""}
              </Button>
            ) : (
              ""
            )}
          </div>
        </div>

        {activeStep === 0 && (
          <section className="flex justify-center mt-16">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-75 justify-start text-left font-normal",
                    !nextPayDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextPayDate ? (
                    format(new Date(nextPayDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 mt-2">
                <Calendar
                  mode="single"
                  selected={nextPayDate ? new Date(nextPayDate) : undefined}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      setNextPayDate(`${yyyy}-${mm}-${dd}`);
                      setCalendarOpen(false);
                    }
                  }}
                  className="mb-4"
                />
              </PopoverContent>
            </Popover>
          </section>
        )}

        {activeStep === 0 && (
          <section className="mt-12">
            <PayrollHistory />
          </section>
        )}

        {payrollSummary.length > 0 && activeStep === 1 && (
          <section className="mt-12">
            <div className="flex space-x-4 justify-between">
              <div>
                <Button onClick={() => discardPayrun()} variant="destructive">
                  <FaTrash size={25} />
                  Discard PayRun
                </Button>
              </div>
              <div className="space-x-3">
                <Button
                  onClick={() => handleResync()}
                  isLoading={isLoadingReSync}
                  variant="outline"
                >
                  <MdOutlineSync size={25} />
                  Sync Payroll
                </Button>
              </div>
            </div>

            {/* ✅ CHANGE: force remount when run changes */}
            <PayslipTable
              key={payrollRunId ?? "no-run-main"}
              data={employeesOnPayroll}
              name=""
            />
            {startersOnPayroll.length > 0 && (
              <PayslipTable
                key={(payrollRunId ?? "no-run") + "-starters"}
                data={startersOnPayroll}
                name="New Starters"
              />
            )}

            {leaversOnPayroll.length > 0 && (
              <PayslipTable
                key={(payrollRunId ?? "no-run") + "-leavers"}
                data={leaversOnPayroll}
                name="Leavers"
              />
            )}
          </section>
        )}

        {activeStep === 2 && (
          <section className="mt-12">
            <SendPayrollForApproval payrollRunId={payrollRunId!} data={data} />
          </section>
        )}

        {activeStep === 3 && (
          <section className="mt-12">
            <PaySummary payrollSummary={payrollSummary} />
          </section>
        )}

        {activeStep === 4 &&
          (isFinalSummaryLoading ? (
            <Loading />
          ) : (
            <section className="mt-12">
              <FinalPayRunTable data={finalSummary ?? []} />
            </section>
          ))}
      </div>
    </ClientGuard>
  );
}
