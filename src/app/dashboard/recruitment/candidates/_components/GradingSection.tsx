"use client";

import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { Button } from "@/shared/ui/button";
import React, { useState } from "react";
import { InterviewerWithScorecard } from "@/types/application";
import { useCreateMutation } from "@/shared/hooks/useCreateMutation";
import { useToast } from "@/shared/hooks/use-toast";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";

function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Fair";
  return "Poor";
}

const GradingSection = ({
  interviewers,
  interviewId,
}: {
  interviewers: InterviewerWithScorecard[];
  interviewId: string;
}) => {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentVisibility, setCommentVisibility] = useState<
    Record<string, boolean>
  >({});

  const handleGradeChange = (key: string, score: number) => {
    setGrades((prev) => ({ ...prev, [key]: score }));
  };

  const toggleComment = (key: string) => {
    setCommentVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  type FeedbackScore = {
    criterionId: string;
    score: number;
    comment?: string;
  };

  const submitFeedback = useCreateMutation({
    endpoint: `/api/interviews/${interviewId}/feedback`,
    successMessage: "Feedback submitted successfully",
    refetchKey: "candidate-application",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populateFormFromFeedback = (interviewerId: string, scores: any[]) => {
    const newGrades: Record<string, number> = {};
    const newComments: Record<string, string> = {};

    const interviewer = interviewers.find((i) => i.id === interviewerId);
    if (!interviewer?.scorecard) return;

    for (const crit of interviewer.scorecard.criteria) {
      const score = scores.find((s) => s.criterionId === crit.criterionId);
      if (!score) continue;

      const key = `${interviewer.id}-${interviewer.scorecard.templateId}-${crit.label}`;
      newGrades[key] = score.score;
      newComments[key] = score.comment || "";
    }

    setGrades((prev) => ({ ...prev, ...newGrades }));
    setComments((prev) => ({ ...prev, ...newComments }));
  };

  const handleSubmit = async () => {
    const feedback: { scores: FeedbackScore[] } = {
      scores: [],
    };

    for (const interviewer of interviewers) {
      const scorecard = interviewer.scorecard;
      if (!scorecard) continue;

      if (Object.keys(grades).length < scorecard.criteria.length) {
        toast({
          title: "No grades submitted",
          description: `Please grade all criteria for ${interviewer.scorecard?.name}'s scorecard.`,
          variant: "destructive",
        });
        return;
      }

      for (const crit of scorecard.criteria) {
        const key = `${interviewer.id}-${scorecard.templateId}-${crit.label}`;
        const score = grades[key];
        const comment = comments[key] ?? "";

        if (score != null) {
          feedback.scores.push({
            criterionId: crit.criterionId,
            score,
            comment: comment.trim() || undefined,
          });
        }
      }
    }
    await submitFeedback(feedback);
    setIsEditing({});
  };

  const fetchInterviewFeedback = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/interviews/4b53fcd5-b786-4d26-8ba5-ad37c8724eca/feedback`,
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate-application"],
    queryFn: () => fetchInterviewFeedback(),
    enabled: Boolean(session?.backendTokens?.accessToken),
    refetchOnMount: true,
  });

  if (status === "loading" || isLoading) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  if (!interviewers || interviewers.length === 0) {
    return <p className="text-muted-foreground">No interviewers assigned.</p>;
  }

  return (
    <div className="space-y-10 mb-10">
      {interviewers.map((interviewer) => {
        const scorecard = interviewer.scorecard;
        if (!scorecard) return null;

        const feedbackEntry = data?.feedback?.[interviewer.id];
        const scoresExist = feedbackEntry?.scores?.length > 0;
        const editing = isEditing[interviewer.id] ?? !scoresExist;

        return (
          <div key={interviewer.id}>
            {data?.overallAverage != null && (
              <div className="mb-4 text-right  text-xl">
                <span className="font-medium text-muted-foreground">
                  Overall Interview Score:
                </span>{" "}
                <span className="text-2xl font-bold">
                  {data.overallAverage.toFixed(2)} (
                  {getScoreLabel(data.overallAverage)})
                </span>
              </div>
            )}
            <div className="mb-4 flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-2xl">
                  {scorecard.name}
                </p>
                <p className="text-muted-foreground">{scorecard.description}</p>
                {/* Average per interviewer */}
                {feedbackEntry?.average != null && !editing && (
                  <p className="text-xl mt-1">
                    <span className="font-medium text-muted-foreground">
                      Your Average Score
                    </span>{" "}
                    <span className="font-bold text-2xl">
                      {feedbackEntry.average.toFixed(2)}(
                      {getScoreLabel(feedbackEntry.average)})
                    </span>
                  </p>
                )}
              </div>
              {scoresExist && !editing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    populateFormFromFeedback(
                      interviewer.id,
                      feedbackEntry.scores,
                    );
                    setIsEditing((prev) => ({
                      ...prev,
                      [interviewer.id]: true,
                    }));
                  }}
                >
                  Edit Feedback
                </Button>
              )}
            </div>

            {!editing ? (
              <ul className="space-y-6">
                {scorecard.criteria.map((crit) => {
                  const scoreData = feedbackEntry.scores.find(
                    (s: { criterionId: string }) =>
                      s.criterionId === crit.criterionId,
                  );
                  return (
                    <li
                      key={crit.criterionId}
                      className="border p-4 rounded-md shadow-2xs bg-muted"
                    >
                      <p className="font-medium text-lg">{crit.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {crit.description}
                      </p>
                      <p className="mt-2 text-md">
                        <strong>Score:</strong>{" "}
                        {scoreData?.score != null
                          ? `${scoreData.score} / 5`
                          : "—"}
                      </p>
                      {scoreData?.comment && (
                        <div
                          className="prose prose-sm mt-2"
                          dangerouslySetInnerHTML={{
                            __html: scoreData.comment,
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="space-y-6">
                {scorecard.criteria
                  .sort((a, b) => a.order - b.order)
                  .map((crit) => {
                    const key = `${interviewer.id}-${scorecard.templateId}-${crit.label}`;
                    const commentVisible = commentVisibility[key] ?? false;
                    const commentValue = comments[key] ?? "";

                    const descriptiveLabels = [
                      "Excellent",
                      "Good",
                      "Average",
                      "Fair",
                      "Poor",
                    ];

                    return (
                      <li
                        key={key}
                        className="border p-4 rounded-md space-y-3 shadow-md"
                      >
                        <div>
                          <p className="font-medium text-lg">{crit.label}</p>
                          <p className="text-muted-foreground text-md">
                            {crit.description}
                          </p>
                        </div>

                        <div className="flex gap-6 flex-wrap items-center text-lg">
                          {[...Array(crit.maxScore)].map((_, i) => {
                            const scoreValue = i + 1;
                            const id = `${key}-${scoreValue}`;
                            const labelIndex = crit.maxScore - scoreValue;
                            const displayLabel =
                              descriptiveLabels[labelIndex] ?? scoreValue;

                            return (
                              <label
                                key={id}
                                htmlFor={id}
                                className="flex items-center gap-1"
                              >
                                <input
                                  type="radio"
                                  id={id}
                                  name={key}
                                  value={scoreValue}
                                  checked={grades[key] === scoreValue}
                                  onChange={() =>
                                    handleGradeChange(key, scoreValue)
                                  }
                                  className="accent-brand"
                                />
                                <span className="text-lg text-muted-foreground">
                                  {displayLabel}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        <div>
                          <Button
                            type="button"
                            onClick={() => toggleComment(key)}
                          >
                            {commentVisible
                              ? "Hide Comment"
                              : `
                            ${
                              Object.values(isEditing).some(Boolean)
                                ? "Edit Comment"
                                : "Add Comment"
                            }`}
                          </Button>
                        </div>

                        {commentVisible && (
                          <div className="mt-2">
                            <RichTextEditor
                              value={commentValue}
                              onChange={(value) =>
                                setComments((prev) => ({
                                  ...prev,
                                  [key]: value,
                                }))
                              }
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        );
      })}

      {/* Submit Button */}
      {Object.values(isEditing).some(Boolean) && (
        <div className="pt-6 mt-8 flex justify-end space-x-3">
          <Button onClick={() => setIsEditing({})} variant={"outline"}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Evaluation</Button>
        </div>
      )}
    </div>
  );
};

export default GradingSection;
