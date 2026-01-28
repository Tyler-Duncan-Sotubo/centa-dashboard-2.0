"use client";

import React from "react";
import { ReservedDaysColumns } from "./ReservedDaysColumns";
import { ReservedDay } from "@/types/reservedDays.type";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import { ReservedDaysModal } from "./ReservedDaysModal";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DataTable } from "@/shared/ui/data-table";

const ReservedDaysPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchReservedDays = async () => {
    try {
      const res = await axiosInstance.get("/api/reserved-days");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery<ReservedDay[]>({
    queryKey: ["reserved-days"],
    queryFn: fetchReservedDays,
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
        title="Reserved Days"
        description="Manage the reserved days for your organization."
      >
        <ReservedDaysModal />
      </PageHeader>
      <DataTable columns={ReservedDaysColumns} data={data} />
    </div>
  );
};

export default ReservedDaysPage;
