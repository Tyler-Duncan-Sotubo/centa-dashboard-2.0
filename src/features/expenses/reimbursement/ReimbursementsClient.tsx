"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import {
  FaListUl,
  FaClock,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import EmptyState from "@/shared/ui/empty-state";
import { useReimbursements } from "../hooks/use-reimbursements";
import { reimbursementsColumns } from "./reimbursementsColumns";
import { Receipt } from "lucide-react";

const tabOptions = [
  {
    value: "all",
    label: "All",
    icon: <FaListUl className="w-4 h-4 text-brand" />,
  },
  {
    value: "pending",
    label: "Pending",
    icon: <FaClock className="w-4 h-4 text-error" />,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: <FaTimesCircle className="w-4 h-4 text-error" />,
  },
  {
    value: "paid",
    label: "Paid",
    icon: <FaCheckCircle className="w-4 h-4 text-success" />,
  },
];

export default function ReimbursementsClient() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const q = useReimbursements();
  const reimbursements = q.data ?? [];

  const filtered = useMemo(() => {
    if (filter === "all") return reimbursements;
    return reimbursements.filter((r) => r.status.toLowerCase() === filter);
  }, [reimbursements, filter]);

  if (q.isLoading) return <Loading />;

  if (q.isError)
    return (
      <div className="p-6">
        Error loading reimbursements.&nbsp;
        <Button variant="link" onClick={() => q.refetch()}>
          Retry
        </Button>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Reimbursements"
        description="View and manage your reimbursement requests."
      >
        <Button onClick={() => router.push("/ess/reimbursements/request")}>
          + New Request
        </Button>
      </PageHeader>

      {reimbursements.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Reimbursements Found"
            description="You have no active reimbursement requests at the moment."
            icon={<Receipt className="h-20 w-20 text-brand mx-auto" />}
          />
        </div>
      ) : (
        <>
          <Tabs value={filter} onValueChange={setFilter} className="my-6">
            <TabsList className="justify-start">
              {tabOptions.map(({ value, label, icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2"
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DataTable columns={reimbursementsColumns} data={filtered} />
        </>
      )}
    </div>
  );
}
