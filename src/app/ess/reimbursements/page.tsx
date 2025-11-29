"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/DataTable";
import { reimbursementsColumns } from "./_components/reimbursementsColumns";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import {
  FaListUl,
  FaClock,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";
import EmptyState from "@/components/empty-state";

type Reimbursement = {
  id: string;
  purpose: string;
  category: string;
  amount: string;
  status: string;
  createdAt: string;
  receiptUrl?: string | null;
  paymentMethod: string;
  rejectionReason?: string | null;
};

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

export default function ReimbursementsPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const fetchReimbursements = async () => {
    const res = await axiosInstance.get(
      `/api/expenses/employee/${session?.user.id}`
    );
    return res.data.data as Reimbursement[];
  };

  const {
    data: reimbursements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["reimbursements"],
    queryFn: fetchReimbursements,
    enabled: !!session?.backendTokens.accessToken,
  });

  const filtered = useMemo(() => {
    if (filter === "all") return reimbursements;
    return reimbursements.filter((r) => r.status.toLowerCase() === filter);
  }, [reimbursements, filter]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="p-6">
        Error loading reimbursements.&nbsp;
        <Button variant="link" onClick={() => refetch()}>
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
        <EmptyState
          title="No Reimbursements Found"
          description="You have no active reimbursement requests at the moment."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585351/expense_dypnis.svg"
          } // or "/images/empty-jobs.png" from public folder
        />
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
