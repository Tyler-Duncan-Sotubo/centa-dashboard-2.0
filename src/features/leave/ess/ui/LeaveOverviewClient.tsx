"use client";

import PageHeader from "@/shared/ui/page-header";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import EmptyState from "@/shared/ui/empty-state";
import LeaveBalanceCarousel from "./LeaveBalanceCarousel";
import LeaveRequestTable from "./LeaveRequestTable";
import { FaUmbrellaBeach } from "react-icons/fa";

export default function LeaveOverviewClient() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const router = useRouter();

  const {
    data: leaveBalance = [],
    isLoading: loadingBalance,
    isError: errorBalance,
  } = useQuery({
    queryKey: ["leave-balance", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/leave-balance/employee/${session?.user.id}`,
      );
      return res.data.data;
    },
  });

  const {
    data: leaveRequests = [],
    isLoading: loadingRequests,
    isError: errorRequests,
  } = useQuery({
    queryKey: ["leaveRequests", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/leave-request/employee/${session?.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
            },
          },
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) return [];
        throw err;
      }
    },
  });

  if (loadingBalance || loadingRequests) return <Loading />;
  if (errorBalance || errorRequests)
    return <p className="text-red-500">Error loading data. Try again.</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leave Overview"
        description="View your leave balances and request history."
      >
        <Button onClick={() => router.push("/ess/leave/request")}>
          + New Request
        </Button>
      </PageHeader>

      {!leaveBalance || Object.keys(leaveBalance).length === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            title="No Leave Balance Found"
            description="It seems like you have no leave balances at the moment. You can request leave to start the process."
            icon={
              <FaUmbrellaBeach size={56} className="text-muted-foreground" />
            }
          />
        </div>
      ) : (
        <>
          <LeaveBalanceCarousel balance={leaveBalance} />
          <LeaveRequestTable data={leaveRequests} />
        </>
      )}
    </div>
  );
}
