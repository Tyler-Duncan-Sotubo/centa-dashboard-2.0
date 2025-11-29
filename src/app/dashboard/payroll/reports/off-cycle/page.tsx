"use client";

import React from "react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/loading";
import OffCyclePayrollReport from "./_components/OffCyclePayrollReport";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const OffCycleReportPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchPayrollOffCycle = async () => {
    try {
      const res = await axiosInstance.get("/api/off-cycle-report/dashboard");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: OffCycleData,
    isLoading: isLoadingOffCycle,
    isError: OffCycleError,
  } = useQuery({
    queryKey: ["off-cycle-report"],
    queryFn: fetchPayrollOffCycle,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoadingOffCycle) return <Loading />;
  if (OffCycleError) return <p>Error loading data</p>;

  return (
    <section className="px-5">
      <OffCyclePayrollReport data={OffCycleData} />
    </section>
  );
};

export default OffCycleReportPage;
