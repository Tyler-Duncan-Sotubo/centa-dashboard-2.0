"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import EmptyState from "@/shared/ui/empty-state";
import { OffboardingSession } from "@/types/offboarding/offboarding.type";
import OffboardingEmployeesTable from "./_components/OffboardingTable";
import { BiLogOutCircle } from "react-icons/bi";

export default function OffboardingPage() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const fetchOffboardingSessions = async () => {
    try {
      const res = await axios.get("/api/offboarding");
      return res.data.data as OffboardingSession[];
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
      return [];
    }
  };

  const { data, isLoading, isError } = useQuery<OffboardingSession[]>({
    queryKey: ["offboarding-sessions"],
    queryFn: fetchOffboardingSessions,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading offboarding sessions</p>;

  return (
    <div className="px-6">
      <div className="mb-6">
        <PageHeader
          title="Recent Offboardings"
          description="Manage ongoing termination processes and checklist tracking."
        />
      </div>

      {data?.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Active Offboarding"
            description="It looks like there are no ongoing termination processes. You can initiate a termination to begin offboarding."
            icon={<BiLogOutCircle />}
          />
        </div>
      ) : (
        <OffboardingEmployeesTable data={data} />
      )}
    </div>
  );
}
