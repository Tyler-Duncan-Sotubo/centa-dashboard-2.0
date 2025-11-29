"use client";

import Loading from "@/components/ui/loading";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { isAxiosError } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import ScoreCardList from "./_components/ScoreCardList";
import CreateScorecardModal from "./_components/CreateScorecardModal";

const ScoreCardSettingsPage = () => {
  const axiosInstance = useAxiosAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const fetchPipelineTemplates = async () => {
    try {
      const res = await axiosInstance.get(
        "/api/interviews/scorecards-templates"
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: scoreCards,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["scoreCards"],
    queryFn: () => fetchPipelineTemplates(),
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <div className="px-4">
      <PageHeader
        title="Hiring Score Cards"
        description="Manage your hiring score cards. Create, edit, or delete templates to streamline your hiring process."
      >
        <Button onClick={() => setIsOpen(true)}>
          <FaPlus className="mr-2" />
          Add New Template
        </Button>
      </PageHeader>
      <ScoreCardList scoreCards={scoreCards} />
      <CreateScorecardModal open={isOpen} setOpen={setIsOpen} />
    </div>
  );
};

export default ScoreCardSettingsPage;
