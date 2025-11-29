"use client";

import React from "react";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import OrgChartStatic, { OrgChartNodeDto } from "./OrgChart";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const OrgchartPage = () => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchOfficeLocations = async () => {
    try {
      const res = await axiosInstance.get("/api/org-chart");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<OrgChartNodeDto[]>({
    queryKey: ["org-chart"],
    queryFn: fetchOfficeLocations,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-500">Failed to load leave settings</div>;

  return <OrgChartStatic data={data || []} />;
};

export default OrgchartPage;
