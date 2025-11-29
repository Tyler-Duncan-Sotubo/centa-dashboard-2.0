"use client";

import { useState } from "react";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import CompetencyList from "./CompetencyList";
import QuestionList from "./QuestionList";

export default function Competencies() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [activeId, setActiveId] = useState<string>("all");

  const fetchCompetencies = async () => {
    try {
      const res = await axios.get("/api/performance-seed/competencies");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const {
    data: competencies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["competencies"],
    queryFn: fetchCompetencies,
    enabled: !!session?.backendTokens.accessToken,
  });

  const active =
    activeId !== "all"
      ? competencies.find((c: { id: string }) => c.id === activeId)
      : undefined;

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading competencies</p>;

  return (
    <section className="px-4">
      <PageHeader
        title="Competency Questions"
        description="Manage questions under each competency."
      />
      <div className="grid grid-cols-3 gap-6 mt-10">
        <CompetencyList
          competencies={competencies}
          activeId={activeId}
          setActiveId={setActiveId}
        />
        <QuestionList
          competency={active}
          activeId={activeId}
          allCompetencies={competencies}
        />
      </div>
    </section>
  );
}
