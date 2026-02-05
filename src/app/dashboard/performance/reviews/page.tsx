"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { FaCommentDots } from "react-icons/fa";
import PerformanceCycleList from "../_components/PerformanceCycleList"; // adjust path if needed
import CreateCycleModal from "../_components/CreateCycleModal";
import { Button } from "@/shared/ui/button";
import { MdLeaderboard } from "react-icons/md";

export default function ReviewsPage() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [open, setOpen] = useState(false);

  const {
    data: cycles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["performance-cycles"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-cycle"); // ✅ findAll
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p className="p-6 text-red-500">Error loading cycles</p>;

  return (
    <section className="p-6 space-y-8">
      <PageHeader
        title="Appraisals Cycles"
        description="Select a performance cycle to view employee reviews"
        icon={<FaCommentDots size={22} />}
      >
        <Button onClick={() => setOpen(true)}>
          <MdLeaderboard /> Create Appraisal Cycle
        </Button>
      </PageHeader>

      <PerformanceCycleList cycles={cycles} />
      <CreateCycleModal open={open} setOpen={setOpen} />
    </section>
  );
}
