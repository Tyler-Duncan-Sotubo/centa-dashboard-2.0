"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/empty-state";
import { OffboardingSession } from "@/types/offboarding/offboarding.type";
import OffboardingEmployeesTable from "./_components/OffboardingTable";

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
        <div className="mt-20">
          <EmptyState
            title="No Active Offboarding"
            description="It looks like there are no ongoing termination processes. You can initiate a termination to begin offboarding."
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585352/exit_y8alak.svg"
          />
        </div>
      ) : (
        <OffboardingEmployeesTable data={data} />
      )}
    </div>
  );
}
