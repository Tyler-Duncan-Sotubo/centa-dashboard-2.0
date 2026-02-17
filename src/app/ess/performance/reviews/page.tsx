"use client";

import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { FaUser } from "react-icons/fa";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReviewEmployeeFormModal from "./_components/ReviewEmployeeFormModal";

type SelfAssessmentRow = {
  id: string;
  cycleId: string;
  cycleName?: string | null;
  createdAt?: string | null;
  status: "not_started" | "in_progress" | "submitted";
  submittedAt?: string | null;
  type: "self" | "peer" | "manager";
};

function badgeForStatus(status: SelfAssessmentRow["status"]) {
  switch (status) {
    case "submitted":
      return { label: "Submitted", color: "submitted" as const };
    case "in_progress":
      return { label: "In Progress", color: "in_progress" as const };
    case "not_started":
    default:
      return { label: "Not Started", color: "not_started" as const };
  }
}

function labelForType(type: SelfAssessmentRow["type"]) {
  switch (type) {
    case "self":
      return "Self";
    case "manager":
      return "Manager";
    case "peer":
      return "Peer";
    default:
      return type;
  }
}

export default function EssSelfAssessmentsListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ess-appraisals", session?.employeeId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/performance-assessments/me/self/${session?.employeeId}`,
      );
      return res.data.data as SelfAssessmentRow[];
    },
    enabled: !!session?.backendTokens?.accessToken && !!session?.employeeId,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <p className="p-4 text-red-600">Error loading appraisals</p>;

  return (
    <div className="mb-20">
      <PageHeader
        title="Appraisals"
        icon={<FaUser size={26} className="text-monzo-success" />}
        description="View and manage your performance appraisals."
      >
        <Button onClick={() => setOpen(true)}>New Appraisal</Button>
      </PageHeader>

      <div className="mt-8">
        {(data ?? []).length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            No appraisals available yet.
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data!.map((a) => {
                  const href = `/ess/performance/reviews/${a.id}`;
                  const statusMeta = badgeForStatus(a.status);

                  return (
                    <TableRow key={a.id}>
                      {/* Cycle */}
                      <TableCell className="font-medium">
                        {a.cycleName ?? "Appraisal"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={statusMeta.color}>
                          {statusMeta.label}
                        </StatusBadge>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-muted-foreground">
                        {a.createdAt
                          ? format(new Date(a.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>

                      {/* Due / Submitted */}
                      <TableCell>
                        {a.submittedAt ? (
                          <span className="text-muted-foreground">
                            {format(new Date(a.submittedAt), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <StatusBadge status="not_submitted">
                            Not submitted
                          </StatusBadge>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={a.type !== "self"} // 🔒 lock non-self
                          variant={
                            a.type !== "self"
                              ? "outline"
                              : a.status === "submitted"
                                ? "outline"
                                : "default"
                          }
                          onClick={() => router.push(href)}
                        >
                          {a.type !== "self"
                            ? "View"
                            : a.status === "submitted"
                              ? "View"
                              : "Open"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <ReviewEmployeeFormModal open={open} setOpen={setOpen} />
    </div>
  );
}
