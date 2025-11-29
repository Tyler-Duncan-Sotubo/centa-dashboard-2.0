"use client";

import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { format, isValid, parseISO } from "date-fns";
import { CiExport } from "react-icons/ci";

interface CycleHeaderProps {
  data: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "upcoming" | "active" | "completed";
  } | null;
}

export default function CycleHeader({ data }: CycleHeaderProps) {
  const start = parseISO(data?.startDate ?? "");
  const end = parseISO(data?.endDate ?? "");

  const formattedStart = isValid(start) ? format(start, "PPP") : "Invalid date";
  const formattedEnd = isValid(end) ? format(end, "PPP") : "Invalid date";

  return (
    <div className="mb-8">
      <PageHeader
        title={`Appraisal Cycle: ${data?.name}`}
        description="View and manage appraisal cycle details"
      >
        <Button variant={"outline"}>
          <CiExport className="mr-2" />
          Export Report
        </Button>
      </PageHeader>

      <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Start Date:</span>{" "}
          {formattedStart}
        </div>
        <div>
          <span className="font-medium text-foreground">End Date:</span>{" "}
          {formattedEnd}
        </div>
        <div>
          <span className="font-medium text-foreground">Status:</span>{" "}
          <StatusBadge status={data?.status} />
        </div>
      </div>
    </div>
  );
}
