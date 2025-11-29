"use client";

import React from "react";
import { BlockedDaysColumns } from "./_components/BlockedDaysColumns";
import { BlockedDay } from "@/types/blockedDays.type";
import { BlockedDaysModal } from "./_components/BlockedDaysModal";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { DataTable } from "@/components/DataTable";

const BlockedDaysPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchBlockedDays = async () => {
    try {
      const res = await axiosInstance.get("/api/blocked-days");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery<BlockedDay[]>({
    queryKey: ["blocked-days"],
    queryFn: fetchBlockedDays,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div>
        <p>Error</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Blocked Days"
        description="Manage the blocked days for your organization."
      >
        <BlockedDaysModal />
      </PageHeader>

      <DataTable columns={BlockedDaysColumns} data={data} />
    </div>
  );
};

export default BlockedDaysPage;
