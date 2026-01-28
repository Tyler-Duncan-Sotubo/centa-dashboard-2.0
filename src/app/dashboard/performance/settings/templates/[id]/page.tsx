/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { use, useEffect, useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import CompetencyList from "../../competency/_components/CompetencyList";
import AssignQuestionsModal from "../_components/AssignQuestionsModal";
import TemplateQuestionList from "../_components/TemplateQuestionList";
import BackButton from "@/shared/ui/back-button";
import { Competency } from "@/types/performance/question-competency.type";

export default function Template({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [activeId, setActiveId] = useState<string | null>("all");

  useEffect(() => {
    if (competencies.length > 0 && !activeId) {
      setActiveId("all");
    }
  }, [activeId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["template-questions", id],
    queryFn: async () => {
      const res = await axios.get(`/api/templates/${id}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const competencies: Competency[] = data?.questions
    ? Object.values(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.questions.reduce((acc: Record<string, Competency>, q: any) => {
          const id = q.competencyId;
          if (!acc[id]) {
            acc[id] = {
              id,
              name: q.competencyName,
              questions: [],
              isGlobal: false,
              companyId: null,
              description: "",
              isActive: true,
              createdAt: "",
            };
          }
          acc[id].questions.push(q);
          return acc;
        }, {}),
      )
    : [];

  const active = competencies.find((c) => c.id === activeId);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading template questions</p>;

  return (
    <section className="px-4">
      <BackButton
        href="/dashboard/performance/settings"
        label="Back to Settings"
      />
      <PageHeader
        title="Template Questions"
        description={`Manage questions for ${data?.name}`}
      />
      <div className="grid grid-cols-3 gap-6 mt-10">
        <CompetencyList
          competencies={competencies}
          activeId={activeId}
          setActiveId={setActiveId}
          isDisabled={true}
        />
        <TemplateQuestionList
          templateId={id}
          questions={
            activeId === "all"
              ? competencies.flatMap((c) =>
                  c.questions.map((q) => ({
                    ...q,
                    competencyName: c.name,
                  })),
                )
              : (active?.questions.map((q) => ({
                  ...q,
                  competencyName: active.name,
                })) ?? [])
          }
        />

        <AssignQuestionsModal open={false} setOpen={() => {}} templateId={id} />
      </div>
    </section>
  );
}
