"use client";

import AsidePanel from "./_components/AsidePanel";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { TopMetrics } from "./_components/TopMetrics";
import { AppraisalOutcomes } from "./_components/AppraisalOutcomes";
import { RecommendationDonut } from "./_components/RecommendationDonut";
import { CompetencyHeatmap } from "./_components/CompetencyHeatmap";
import { GoalAndFeedbackCharts } from "./_components/GoalAndFeedbackCharts";
import AppraisalCycleList from "./appraisals/_components/AppraisalCycleList";
import { TopEmployeesSection } from "./_components/TopEmployeesSection";
import { Skeleton } from "@/shared/ui/skeleton";

export default function PerformanceDashboard() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const {
    data: performanceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["performance-overview"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-report/overview");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading settings</p>;

  const hasAppraisals = performanceData?.cycleHealth?.totalAppraisals > 0;
  const hasScores =
    performanceData?.appraisalOutcomes &&
    Object.values(
      performanceData.appraisalOutcomes.scoreDistribution || {},
    ).some((v) => (v as number) > 0);
  const hasRecommendations =
    performanceData?.appraisalOutcomes &&
    performanceData.appraisalOutcomes.recommendationCounts &&
    Object.values(performanceData.appraisalOutcomes.recommendationCounts).some(
      (v) => (v as number) > 0,
    );
  const hasHeatmap =
    performanceData?.competencyInsights?.heatmap &&
    Object.keys(performanceData.competencyInsights.heatmap).length > 0;
  const hasTopEmployees =
    Array.isArray(performanceData?.topEmployees) &&
    performanceData.topEmployees.length > 0 &&
    performanceData.topEmployees[0]?.employeeId;

  const { goalPerformance, feedbackActivity } = performanceData || {};

  const hasGoals = goalPerformance?.totalGoals > 0;

  const hasFeedback =
    feedbackActivity &&
    (feedbackActivity.peerCount > 0 ||
      feedbackActivity.managerCount > 0 ||
      feedbackActivity.selfCount > 0);

  return (
    <section className="px-5 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT */}

        <div className="space-y-14 col-span-8">
          <div>
            <h3 className="text-xl font-semibold">Appraisal Cycle Overview</h3>
            {performanceData?.appraisalCycle ? (
              <AppraisalCycleList cycles={[performanceData.appraisalCycle]} />
            ) : (
              <div className="text-gray-500">No appraisal cycle yet.</div>
            )}
          </div>

          {!hasAppraisals &&
            !hasScores &&
            !hasRecommendations &&
            !hasHeatmap && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

          {hasAppraisals && (
            <TopMetrics
              totalAppraisals={performanceData.cycleHealth.totalAppraisals}
              completionRate={performanceData.cycleHealth.completionRate}
              onTimeReviews={performanceData.cycleHealth.onTimeCount}
              avgTimeToComplete={
                performanceData.cycleHealth.avgTimeToCompleteDays
              }
            />
          )}

          <div>
            {hasScores && hasRecommendations && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  Appraisal Outcomes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="col-span-1">
                    {hasScores ? (
                      <AppraisalOutcomes
                        avgScore={performanceData.appraisalOutcomes.avgScore}
                        scoreDistribution={[
                          {
                            name: "0-50",
                            value:
                              performanceData.appraisalOutcomes
                                .scoreDistribution["0-50"],
                          },
                          {
                            name: "51-70",
                            value:
                              performanceData.appraisalOutcomes
                                .scoreDistribution["51-70"],
                          },
                          {
                            name: "71-85",
                            value:
                              performanceData.appraisalOutcomes
                                .scoreDistribution["71-85"],
                          },
                          {
                            name: "86-100",
                            value:
                              performanceData.appraisalOutcomes
                                .scoreDistribution["86-100"],
                          },
                        ]}
                      />
                    ) : (
                      <div className="text-gray-500 px-4 py-8">
                        No appraisal outcome scores yet.
                      </div>
                    )}
                  </div>
                  <div className="col-span-1">
                    {hasRecommendations ? (
                      <RecommendationDonut
                        recommendationCounts={
                          performanceData.appraisalOutcomes.recommendationCounts
                        }
                        periodLabel={performanceData.appraisalCycle.name}
                      />
                    ) : (
                      <div className="text-gray-500 px-4 py-8">
                        No recommendations yet.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {hasHeatmap && (
            <CompetencyHeatmap
              heatmap={performanceData.competencyInsights.heatmap}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          {hasTopEmployees && (
            <TopEmployeesSection employees={performanceData.topEmployees} />
          )}

          <AsidePanel />

          {hasGoals && hasFeedback && (
            <GoalAndFeedbackCharts
              goalPerformance={performanceData.goalPerformance}
              feedbackActivity={performanceData.feedbackActivity}
            />
          )}
        </div>
      </div>
    </section>
  );
}
