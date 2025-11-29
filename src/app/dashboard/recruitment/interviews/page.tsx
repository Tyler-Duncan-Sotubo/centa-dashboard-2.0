"use client";

import React from "react";
import InterviewCalendar from "./_components/InterviewCalendar";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

const InterviewPage = () => {
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();

  const fetchInterviews = async () => {
    try {
      const res = await axiosInstance.get("/api/interviews");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => fetchInterviews(),
    enabled: !!session?.backendTokens.accessToken,
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;
  return (
    <div className="px-4">
      <InterviewCalendar interviews={data} />
    </div>
  );
};

export default InterviewPage;
