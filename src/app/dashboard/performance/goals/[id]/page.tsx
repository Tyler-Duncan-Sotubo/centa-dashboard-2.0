/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/shared/ui/loading";
import BackButton from "@/shared/ui/back-button";
import EmployeeCard from "../_components/EmployeeCard";
import { GoalDetailsCard } from "../_components/GoalDetailsCard";
import GoalActionButtons from "../_components/GoalActionButtons";
import ActivityFeed from "../_components/ActivityFeed";
import { CommentSection } from "../_components/CommentSection";
import PageHeader from "@/shared/ui/page-header";
import { useUpdateMutation } from "@/shared/hooks/useUpdateMutation";
import { Button } from "@/shared/ui/button";
import { FaCheck } from "react-icons/fa6";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function GoalDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const startGoal = useUpdateMutation({
    endpoint: `/api/performance-goals/${id}/publish`,
    successMessage: "Goal started successfully",
    refetchKey: "goal",
  });

  const { data: goal = [], isLoading } = useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-goals/${id}`);
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (isLoading) return <Loading />;

  return (
    <section className="p-6">
      <div className="flex items-center justify-between mb-8">
        <BackButton
          href="/dashboard/performance/goals"
          className="mb-4"
          label="Back to Goals"
        />
        {goal.status !== "draft" && <GoalActionButtons goalId={id} />}
        {goal.status === "draft" && (
          <Button onClick={() => startGoal({})} className="flex items-center">
            <FaCheck className="mr-2 w-4 h-4" />
            Start Goal
          </Button>
        )}
      </div>

      <PageHeader title="Goal Details">
        <h2 className="text-lg font-semibold text-gray-700">Activities</h2>
      </PageHeader>

      {/* Goal Summary and Actions */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Left: Summary + Actions */}
        <div className="md:col-span-2 space-y-4">
          <EmployeeCard goal={goal} />
          <GoalDetailsCard goal={goal} />
          <CommentSection goalId={id} status={goal.status} />
        </div>

        {/* Right: Activity Feed */}
        <ActivityFeed goal={goal} />
      </div>
    </section>
  );
}
