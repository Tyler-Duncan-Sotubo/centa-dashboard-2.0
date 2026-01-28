"use client";

import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import PipelineTemplateList from "./_components/PipelineTemplateList";

const PipelinePage = () => {
  const axiosInstance = useAxiosAuth();
  const { data: session, status } = useSession();
  const fetchPipelineTemplates = async () => {
    try {
      const res = await axiosInstance.get("/api/pipeline/templates");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: templates,
    isLoading: isTemplatesLoading,
    isError,
  } = useQuery({
    queryKey: ["pipelineTemplates"],
    queryFn: () => fetchPipelineTemplates(),
    enabled: Boolean(session?.backendTokens?.accessToken),
    retry: 2,
  });

  if (status === "loading" || isTemplatesLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-5">
      <PipelineTemplateList templates={templates} />
    </div>
  );
};

export default PipelinePage;
