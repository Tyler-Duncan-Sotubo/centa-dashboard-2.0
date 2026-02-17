"use client";

import Loading from "@/shared/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { use } from "react";
import BackButton from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";

import { FaBullseye, FaListUl, FaFlagCheckered } from "react-icons/fa6";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import ReviewHeader from "@/app/dashboard/performance/reviews/_components/ReviewHeader";
import QuestionnaireSection from "@/app/dashboard/performance/reviews/_components/QuestionnaireSection";
import GoalsSection from "@/app/dashboard/performance/reviews/_components/GoalsSection";
import SelfSummarySection from "../_components/SelfSummarySection";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EssSelfAssessmentDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const {
    data: review,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-assessments/${id}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken) && !!id,
  });

  const startReview = useUpdateMutation({
    endpoint: `/api/performance-assessments/${id}/start`,
    successMessage: "Self assessment started",
    refetchKey: "assessment",
  });

  const submitSelf = useCreateMutation({
    endpoint: `/api/performance-assessments/self/${id}/submit`,
    successMessage: "Self assessment submitted",
    refetchKey: "assessment",
  });

  if (isLoading) return <Loading />;
  if (isError || !review)
    return <p className="p-4 text-red-600">Error loading assessment</p>;

  const isSubmitted = review.status === "submitted";

  return (
    <section className="mb-20">
      <BackButton
        href={`/ess/performance/reviews`}
        label="Back to Appraisals"
      />

      <section className="space-y-8">
        <ReviewHeader review={review} />

        {review.status === "not_started" ? (
          <div className="p-8 flex justify-center flex-col items-center h-[50vh] space-y-4">
            <h2 className="text-xl font-semibold">
              Self assessment not started
            </h2>
            <p className="text-muted-foreground">Click below to begin.</p>
            <Button onClick={() => startReview()}>Start</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button
                onClick={() => submitSelf()}
                disabled={isSubmitted}
                variant={isSubmitted ? "outline" : "default"}
              >
                {isSubmitted ? "Submitted" : "Submit Self Assessment"}
              </Button>
            </div>

            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="questions">
                  <FaListUl className="mr-2 w-4 h-4" />
                  Questionnaire
                </TabsTrigger>

                <TabsTrigger value="goals">
                  <FaBullseye className="mr-2 w-4 h-4" />
                  Goals
                </TabsTrigger>

                <TabsTrigger value="summary">
                  <FaFlagCheckered className="mr-2 w-4 h-4" />
                  Summary
                </TabsTrigger>
              </TabsList>

              <div className="pt-4">
                <TabsContent value="questions">
                  <QuestionnaireSection
                    questions={review.questions}
                    assessmentId={id}
                    comment={
                      review.sectionComments?.find(
                        (c: any) => c.section === "questionnaire",
                      )?.comment ?? ""
                    }
                  />
                </TabsContent>

                <TabsContent value="goals">
                  <GoalsSection
                    goals={review.goals ?? []}
                    assessmentId={id}
                    comment={
                      review.sectionComments?.find(
                        (c: any) => c.section === "goals",
                      )?.comment ?? ""
                    }
                  />
                </TabsContent>

                <TabsContent value="summary">
                  <SelfSummarySection
                    assessmentId={id}
                    initialSummary={review.selfSummary?.summary ?? ""}
                    disabled={isSubmitted}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </section>
    </section>
  );
}
