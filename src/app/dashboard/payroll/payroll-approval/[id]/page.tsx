"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import { format } from "date-fns";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { useToast } from "@/shared/hooks/use-toast";
import { Download } from "lucide-react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { ClientGuard } from "@/lib/guard/ClientGuard";

type Props = {
  params: Promise<{ id: string }>;
};

interface ApprovalStep {
  id: string;
  sequence: number;
  role: string;
  status: "pending" | "approved" | "rejected";
  minApprovals: number;
  maxApprovals: number;
  createdAt: string;
}

interface PayrollApprovalStatus {
  approvalStatus: "submitted" | "approved" | "rejected" | string;
  approvalSteps: ApprovalStep[];
  payrollDate: string;
}

export default function PayrollApprovalPage({ params }: Props) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const { toast } = useToast();
  const [remarks, setRemarks] = useState("");

  const fetchApprovalStatus = async (
    id: string,
  ): Promise<PayrollApprovalStatus> => {
    const res = await axiosInstance.get(`/api/payroll/approval-status/${id}`);
    return res.data.data;
  };

  const { data, isLoading, isError } = useQuery<PayrollApprovalStatus>({
    queryKey: ["approval-status", id],
    queryFn: () => fetchApprovalStatus(id),
    enabled: !!session?.backendTokens?.accessToken,
  });

  const currentUserRole = session?.user?.role;
  const steps = data?.approvalSteps ?? [];
  const currentStep = steps.find((s) => s.status === "pending");

  const updateApprovalStatus = useUpdateMutation({
    endpoint: `/api/payroll/${id}/approve`,
    successMessage: "Payroll approved successfully",
    refetchKey: "approval-status",
  });

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentStep) return;
    await updateApprovalStatus({
      remarks: remarks,
    });
  };

  if (status === "loading" || isLoading) return <Loading />;
  if (isError || !data) return <p>Error loading data</p>;

  const handleDownload = async () => {
    try {
      setIsLoadingDownload(true);
      const res = await axiosInstance.get(
        `/api/payroll-report/payment-advice/${id}?format=internal`,
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      const url = res.data?.data?.url?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get download link.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setIsLoadingDownload(false);
    }
  };

  return (
    <ClientGuard
      need={["dashboard.login", "payroll.run.calculate"]}
      onMissing="/dashboard"
    >
      <div className="max-w-3xl mt-10 space-y-6 px-5">
        <PageHeader
          title="Payroll Approval"
          description="Manage payroll approvals and audit trails."
        >
          <Button
            variant="link"
            className="p-0 text-md"
            onClick={() => {
              handleDownload();
            }}
            disabled={isLoadingDownload}
          >
            <Download size={16} />
            open the detailed report
          </Button>
        </PageHeader>

        {/* Step Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Approval Workflow For{" "}
              {format(new Date(data.payrollDate), "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="capitalize font-medium">
                    {step.role.replace("_", " ")}
                  </div>
                  <Badge variant={step.status}>
                    {step.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approval Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              You are logged in as:{" "}
              <span className="font-medium capitalize text-foreground">
                {currentUserRole?.replace("_", " ")}
              </span>
            </p>

            {currentUserRole === currentStep?.role ? (
              <form onSubmit={handleApprove} className="space-y-4">
                <Textarea
                  placeholder="Add optional remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <Button type="submit">Approve</Button>
              </form>
            ) : (
              <p className="text-muted-foreground">
                Waiting for {currentStep?.role.replace("_", " ")}&apos;s
                approval.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 pr-2">
              <ul className="space-y-2 text-sm">
                {steps
                  .filter((s) => s.status === "approved")
                  .map((s) => (
                    <li key={s.id}>✅ {s.role.replace("_", " ")} – Approved</li>
                  ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </ClientGuard>
  );
}
