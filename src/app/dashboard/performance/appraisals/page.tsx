"use client";

import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import AppraisalCycleModal from "./_components/AppraisalCycleModal";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import Loading from "@/components/ui/loading";
import AppraisalCycleList from "./_components/AppraisalCycleList";

const AppraisalPage = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["appraisal-cycles"],
    queryFn: async () => {
      const res = await axios.get(`/api/appraisals/cycle`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading departments</p>;

  return (
    <div className="px-4">
      <PageHeader
        title="Appraisals"
        description="Manage appraisal cycles and performance reviews."
      >
        <Button onClick={() => setOpen(true)}>
          <FaPlusCircle className="mr-2" />
          Create Appraisal Cycle
        </Button>
      </PageHeader>
      <div className="mt-10">
        <AppraisalCycleList cycles={data} />
        <AppraisalCycleModal open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default AppraisalPage;
