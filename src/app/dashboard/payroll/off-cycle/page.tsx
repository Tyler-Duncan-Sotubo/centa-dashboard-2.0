"use client";

import { isAxiosError } from "@/lib/axios";
import React, { useEffect, useState } from "react";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/pageHeader";
import {
  Banknote,
  Calendar as CalendarIcon,
  FileText,
  CheckSquare,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { EmployeeDetail } from "@/types/payRunDetails";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { MdOutlineSync } from "react-icons/md";
import { SendPayrollForApproval } from "../_components/SendPayrollForApproval";
import {
  OffCycleType,
  PayrollOffCyclePicker,
} from "./_components/PayrollOffCyclePicker";
import { OffCyclePayrollTable } from "./_components/OffCycleEmployeesTable";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { OffCyclePayOverviewTable } from "./_components/OffCyclePayOverviewTable";
import { OffCyclePayrollHistory } from "./_components/OffCyclePayrollHistory";
import { ClientGuard } from "@/components/guard/ClientGuard";

const steps = [
  { label: "Start", icon: <CalendarIcon className="h-5 w-5" /> },
  { label: "Review", icon: <FileText className="h-5 w-5" /> },
  { label: "Pay", icon: <Banknote className="h-5 w-5" /> },
  { label: "Confirm", icon: <CheckSquare className="h-5 w-5" /> },
];

export default function Payroll() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("payrollActiveStep");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [loadingStep, setLoadingStep] = useState(false);
  const [nextPayDate, setNextPayDate] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [payrollSummary, setPayrollSummary] = useState<EmployeeDetail[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem("offCycleSummary");
    return stored ? JSON.parse(stored) : [];
  });
  const [offCycleEmployees, setOffCycleEmployees] = useState<OffCycleType[]>(
    () => {
      if (typeof window === "undefined") return [];
      const stored = window.localStorage.getItem("offCycleEmployees");
      return stored ? JSON.parse(stored) : [];
    }
  );
  const [isLoadingReSync, setIsLoadingReSync] = React.useState(false);

  const payrollRunId = payrollSummary?.[0]?.payrollRunId;

  useEffect(() => {
    if (!payrollSummary.length) return;
    // 1) Persist the summary
    localStorage.setItem("offCycleSummary", JSON.stringify(payrollSummary));
    // 2) Figure out if this run was already sent for approval
    const runId = payrollRunId;
    const sentAlready = localStorage.getItem(`payrollSent:${runId}`) === "true";
    // 3) Advance to Review or directly to Pay
    setActiveStep(sentAlready ? 2 : 1);
  }, [payrollRunId, payrollSummary]);

  const fetchApprovalStatus = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/payroll/approval-status/${id}`);
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return "";
      }
    }
  };

  const {
    data,
    isLoading: isLoadingStatus,
    isError,
  } = useQuery({
    queryKey: ["payrollStatus"],
    queryFn: async () => {
      if (!payrollRunId || !session?.backendTokens?.accessToken) {
        return null;
      }
      const data = await fetchApprovalStatus(payrollRunId);
      if (data?.approvalStatus === "approved" && activeStep === 2) {
        setActiveStep(3);
      }
      return data;
    },
    refetchInterval: activeStep === 2 ? 20000 : false,
    enabled: !!payrollRunId && !!session?.backendTokens?.accessToken,
  });

  const createPayroll = useCreateMutation({
    endpoint: `/api/off-cycle/run-off-cycle/${offCycleEmployees[0]?.payrollRunId}`,
    successMessage: "Off Cycle Payroll created successfully",
    refetchKey: "payroll pay-date",
    onSuccess: (created) => {
      const data = created as { data: EmployeeDetail[] };
      localStorage.setItem("offCycleSummary", JSON.stringify(data.data));
      setPayrollSummary(data.data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const completePayRun = useUpdateMutation({
    endpoint: `/api/payroll/${payrollRunId}/payment-in-progress`,
    successMessage: "Payroll completed successfully",
    refetchKey: "payroll pay-date",
    onSuccess: () => {
      setActiveStep(4);
      localStorage.removeItem("offCycleSummary");
      localStorage.removeItem("payrollActiveStep");
      localStorage.removeItem("offCycleEmployees");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const reSyncPayroll = useCreateMutation({
    endpoint: `/api/off-cycle/run-off-cycle/${offCycleEmployees[0]?.payrollRunId}`,
    successMessage: "Payroll synced successfully",
    refetchKey: "payroll pay-date",
    onSuccess: (created) => {
      const data = created as { data: EmployeeDetail[] };
      localStorage.setItem("offCycleSummary", JSON.stringify(data.data));
      setPayrollSummary(data.data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleResync = async () => {
    localStorage.removeItem("payrollSummary");
    setIsLoadingReSync(true);
    await reSyncPayroll({
      payrollDate: offCycleEmployees[0]?.payrollDate,
    });
    setIsLoadingReSync(false);
  };

  if (status === "loading" || isLoadingStatus) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  const stepActions: Array<() => Promise<void>> = [
    async () => {
      setLoadingStep(true);
      await createPayroll({
        payrollDate: offCycleEmployees[0]?.payrollDate,
      });
      setLoadingStep(false);
    },
    async () => {
      setActiveStep(2);
    },
    async () => console.log("Triggering payment…"),
    async () => {
      setActiveStep(4);
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
  const isStepDisabled = [3, 4].includes(activeStep) || loadingStep;

  const employeesOnPayroll = payrollSummary.filter(
    (employee) => employee.isLeaver === false && employee.isStarter === false
  );

  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <div className="px-6">
        <div className="">
          <PageHeader
            title="Preview Off-Cycle Pay Run"
            description="Review and confirm the off-cycle pay run for your employees."
          />
        </div>

        {/* Progress Indicator */}
        <div className="w-full mt-16 flex justify-center">
          <div className="w-full flex items-center justify-between">
            {/* Back on the left */}
            <Button
              variant="outline"
              onClick={() => {
                if (activeStep === 1) {
                  setPayrollSummary([]);
                  setActiveStep(0);
                } else {
                  // otherwise just go back one step
                  setActiveStep((prev) => Math.max(prev - 1, 0));
                }
              }}
              disabled={isStepDisabled}
            >
              Back
            </Button>

            {/* Steps in the center */}
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
                          : "border-gray-300 bg-white"
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
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 self-center h-1.5 mb-5 mx-1", // slightly thicker
                        idx < activeStep ? "bg-brand" : "bg-gray-300"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next on the right */}

            {activeStep < steps.length ? (
              <Button
                onClick={handleNext}
                isLoading={loadingStep}
                disabled={activeStep === 0 && offCycleEmployees.length === 0}
              >
                {activeStep === 0
                  ? "Calculate Payroll"
                  : activeStep === 1
                  ? "Send for Approval"
                  : activeStep === 2
                  ? "Pay Employees "
                  : activeStep === 3
                  ? "Finalize"
                  : ""}
              </Button>
            ) : null}
          </div>
        </div>

        {activeStep === 0 && (
          <section className="mt-20">
            <div className="flex space-x-4 justify-end">
              {/* Calendar Picker */}
              {activeStep === 0 && (
                <section className="flex justify-center">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !nextPayDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextPayDate
                          ? format(new Date(nextPayDate), "PPP")
                          : format(new Date(), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mt-2">
                      <Calendar
                        mode="single"
                        selected={
                          nextPayDate ? new Date(nextPayDate) : undefined
                        }
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            // build a pure “YYYY-MM-DD” string in local time
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
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
              <PayrollOffCyclePicker
                payrollDate={nextPayDate}
                setOffCycleEmployees={setOffCycleEmployees}
              />
              <Button
                onClick={() => handleResync()}
                isLoading={isLoadingReSync}
                variant="outline"
              >
                <MdOutlineSync size={25} />
                Sync Payroll
              </Button>
            </div>
          </section>
        )}
        {/* History */}
        {activeStep === 0 && offCycleEmployees.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Off-Cycle Details</h2>
            <OffCyclePayrollTable
              data={offCycleEmployees}
              setOffCycleEmployees={setOffCycleEmployees}
            />
          </section>
        )}

        {activeStep === 0 && (
          <section className="mt-12">
            <OffCyclePayrollHistory />
          </section>
        )}

        {/* Loading */}
        {activeStep === 1 && (
          <section className="mt-12">
            <OffCyclePayOverviewTable data={employeesOnPayroll} name="" />
          </section>
        )}
        {activeStep == 2 && (
          <section className="mt-12">
            <SendPayrollForApproval
              payrollRunId={payrollSummary[0].payrollRunId}
              data={data}
            />
          </section>
        )}

        {payrollSummary.length > 0 && activeStep === 4 && (
          <section className="mt-12">
            <OffCyclePayOverviewTable data={payrollSummary} name="" />
          </section>
        )}
      </div>
    </ClientGuard>
  );
}
