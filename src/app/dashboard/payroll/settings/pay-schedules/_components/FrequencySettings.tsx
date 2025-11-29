"use client";

import React from "react";
import ChangePayFrequencyForm from "./ChangePayFrequencyForm";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import PageHeader from "@/components/pageHeader";

const FrequencySettings = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchCompanyPaySchedule = async () => {
    try {
      const res = await axiosInstance.get("/api/pay-schedules");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: schedule,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pay-schedules"],
    queryFn: fetchCompanyPaySchedule,
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-4">
      <PageHeader
        title="Pay Schedules"
        description="Manage your company's pay schedules"
      />
      <ChangePayFrequencyForm schedules={schedule} />
    </div>
  );
};

export default FrequencySettings;
