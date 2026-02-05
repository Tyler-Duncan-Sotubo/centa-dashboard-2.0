"use client";

import AsidePanel from "./_components/AsidePanel";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { GoalAndFeedbackCharts } from "./_components/GoalAndFeedbackCharts";
import { TopEmployeesSection } from "./_components/TopEmployeesSection";
import { Skeleton } from "@/shared/ui/skeleton";
import PerformanceCycleList from "./_components/PerformanceCycleList";
import { PerformanceKPIs } from "./_components/PerformanceKPIs";

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

  const performanceCycle = performanceData?.performanceCycle;

  const assessmentActivity = performanceData?.assessmentActivity;
  const hasAssessments = (assessmentActivity?.total || 0) > 0;

  const hasTopEmployees =
    Array.isArray(performanceData?.topEmployees) &&
    performanceData.topEmployees.length > 0 &&
    performanceData.topEmployees[0]?.employeeId;

  const goalPerformance = performanceData?.goalPerformance;
  const feedbackActivity = performanceData?.feedbackActivity;

  const hasGoals = (goalPerformance?.totalGoals || 0) > 0;

  const hasFeedback =
    feedbackActivity &&
    ((feedbackActivity.peerCount || 0) > 0 ||
      (feedbackActivity.managerCount || 0) > 0 ||
      (feedbackActivity.selfCount || 0) > 0);

  const showCharts = hasGoals || hasFeedback;

  return (
    <section className="px-5 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="space-y-10 col-span-8">
          <div>
            <h3 className="text-xl font-semibold">
              Performance Cycle Overview
            </h3>

            {performanceCycle ? (
              <PerformanceCycleList cycles={[performanceCycle]} />
            ) : (
              <div className="text-gray-500">
                No active performance cycle yet.
              </div>
            )}
          </div>

          {!performanceCycle && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {/* ✅ KPI cards (assessment driven) */}
          {hasAssessments ? (
            <PerformanceKPIs
              totalAssessments={assessmentActivity.total}
              submitted={assessmentActivity.submitted}
              avgScore={assessmentActivity.avgScore}
            />
          ) : (
            <div className="text-gray-500">No assessment activity yet.</div>
          )}

          {showCharts && (
            <GoalAndFeedbackCharts
              goalPerformance={
                goalPerformance || {
                  totalGoals: 0,
                  completedGoals: 0,
                  overdueGoals: 0,
                }
              }
              feedbackActivity={
                feedbackActivity || {
                  peerCount: 0,
                  managerCount: 0,
                  selfCount: 0,
                  avgPerEmployee: 0,
                  anonymityRate: 0,
                }
              }
            />
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          {hasTopEmployees && (
            <TopEmployeesSection employees={performanceData.topEmployees} />
          )}

          <AsidePanel />
        </div>
      </div>
    </section>
  );
}
