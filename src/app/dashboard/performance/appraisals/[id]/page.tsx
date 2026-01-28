"use client";

import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import CycleHeader from "./_components/CycleHeader";
import ParticipantsTable from "./_components/ParticipantsTable";
import BackButton from "@/shared/ui/back-button";
import { FaCirclePlus } from "react-icons/fa6";
import { Button } from "@/shared/ui/button";
import AppraisalModal from "./_components/AppraisalModal";

type PageProps = {
  params: Promise<{ id: string }>;
};

const CycleDetailPage = ({ params }: PageProps) => {
  const { id } = React.use(params);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  // 1. Fetch appraisal cycle details
  const {
    data: cycle,
    isLoading: isCycleLoading,
    isError: isCycleError,
  } = useQuery({
    queryKey: ["appraisal-cycle", id],
    queryFn: async () => {
      const res = await axios.get(`/api/appraisals/cycle/${id}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  // 2. Fetch participants for the cycle
  const {
    data: participants,
    isLoading: isParticipantsLoading,
    isError: isParticipantsError,
  } = useQuery({
    queryKey: ["appraisal-participants", id],
    queryFn: async () => {
      const res = await axios.get(`/api/appraisals/${id}/appraisals`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  // Handle loading/error state
  if (isCycleLoading || isParticipantsLoading) return <Loading />;
  if (isCycleError || isParticipantsError)
    return <p>Error loading appraisal data</p>;

  return (
    <div className="px-4">
      <BackButton
        href="/dashboard/performance/appraisals"
        className="mb-4"
        label="Back to Appraisals Cycles"
      />

      <CycleHeader data={cycle} />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}>
          <FaCirclePlus className="mr-2" />
          Add Participant
        </Button>
      </div>

      <ParticipantsTable data={participants} />

      <AppraisalModal open={open} setOpen={setOpen} cycleId={cycle?.id} />
    </div>
  );
};

export default CycleDetailPage;
