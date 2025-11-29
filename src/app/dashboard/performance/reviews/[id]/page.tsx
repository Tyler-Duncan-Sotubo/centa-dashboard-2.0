"use client";

import Loading from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ReviewHeader from "../_components/ReviewHeader";
import QuestionnaireSection from "../_components/QuestionnaireSection";
import GoalsSection from "../_components/GoalsSection";
import AttendanceSection from "../_components/AttendanceSection";
import FeedbackSection from "../_components/FeedbackSection";
import ConclusionSection from "../_components/Conclusion";
import {
  FaBullseye,
  FaClock,
  FaComments,
  FaFlagCheckered,
  FaListUl,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import BackButton from "@/components/ui/back-button";

interface Props {
  params: { id: string };
}

export default function ReviewDetailPage({ params }: Props) {
  const { id } = params;
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [conclusion, setConclusion] = useState({
    summary: "",
    strengths: "",
    areasForImprovement: "",
    finalScore: null,
    promotionRecommendation: "",
  });

  const { data: review, isLoading } = useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-assessments/${id}`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken && !!id,
  });

  const startReview = useUpdateMutation({
    endpoint: `/api/performance-assessments/${id}/start`,
    successMessage: "Review started successfully",
    refetchKey: "assessment",
  });

  if (isLoading || !review) return <Loading />;

  return (
    <section className="px-4 mb-20">
      <BackButton
        href="/dashboard/performance/reviews"
        label="Back to Reviews"
      />

      <section className="space-y-8">
        <ReviewHeader review={review} />
        {review.status === "not_started" ? (
          <div className="p-8 flex justify-center flex-col items-center h-[50vh] space-y-4">
            <h2 className="text-xl font-semibold">
              Review has not started yet
            </h2>
            <p className="text-muted-foreground">
              Click below to begin this performance assessment.
            </p>
            <Button onClick={() => startReview()}>Start Review</Button>
          </div>
        ) : (
          <Tabs defaultValue="questions" className="w-full ">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="questions">
                <FaListUl className="mr-2 w-4 h-4 text-monzo-brandDark" />
                Questionnaire
              </TabsTrigger>

              {review?.goals && (
                <TabsTrigger value="goals">
                  <FaBullseye className="mr-2 w-4 h-4 text-monzo-secondary" />
                  Goals
                </TabsTrigger>
              )}

              {review?.feedback && (
                <TabsTrigger value="feedback">
                  <FaComments className="mr-2 w-4 h-4 text-monzo-error" />
                  Feedback
                </TabsTrigger>
              )}

              {Object.keys(review.attendance || {}).length > 0 && (
                <TabsTrigger value="attendance">
                  <FaClock className="mr-2 w-4 h-4 text-monzo-success" />
                  Attendance
                </TabsTrigger>
              )}

              <TabsTrigger value="conclusion">
                <FaFlagCheckered className="mr-2 w-4 h-4 text-muted-foreground" />
                Conclusion
              </TabsTrigger>
            </TabsList>

            <div className="pt-4">
              {/** Questionnaire Tab */}
              <TabsContent value="questions">
                <QuestionnaireSection
                  questions={review.questions}
                  assessmentId={id}
                  comment={
                    review.sectionComments.find(
                      (c: { section: string }) => c.section === "questionnaire"
                    )?.comment ?? ""
                  }
                />
              </TabsContent>

              {/** Goals Tab */}
              <TabsContent value="goals">
                <GoalsSection
                  goals={review.goals}
                  assessmentId={id}
                  comment={
                    review.sectionComments.find(
                      (c: { section: string }) => c.section === "goals"
                    )?.comment ?? ""
                  }
                />
              </TabsContent>

              {/** Feedback Tab */}
              <TabsContent value="feedback">
                <FeedbackSection
                  feedback={review.feedback}
                  assessmentId={id}
                  comment={
                    review.sectionComments.find(
                      (c: { section: string }) => c.section === "feedback"
                    )?.comment ?? ""
                  }
                />
              </TabsContent>

              {/** Attendance Tab */}
              <TabsContent value="attendance">
                <AttendanceSection
                  attendance={review.attendance}
                  assessmentId={id}
                  comment={
                    review.sectionComments.find(
                      (c: { section: string }) => c.section === "attendance"
                    )?.comment ?? ""
                  }
                />
              </TabsContent>

              {/** Conclusion Tab */}
              <TabsContent value="conclusion">
                <ConclusionSection
                  conclusion={conclusion}
                  assessmentId={id}
                  onChange={(field, val) =>
                    setConclusion((prev) => ({ ...prev, [field]: val }))
                  }
                  questions={review.questions}
                  employeeName={review.revieweeName}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </section>
    </section>
  );
}
