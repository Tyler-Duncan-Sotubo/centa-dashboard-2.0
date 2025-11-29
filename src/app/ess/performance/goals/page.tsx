"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaTasks,
  FaCheck,
  FaClock,
  FaArchive,
  FaListUl,
  FaPlusCircle,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import GoalModal from "./_components/GoalFormModal";
import Loading from "@/components/ui/loading";
import { TbTarget } from "react-icons/tb";
import GoalList from "./_components/GoalList";

export default function GoalsPage() {
  const [status, setStatus] = useState("published");
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

  const {
    data: goals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["goals", status],
    queryFn: async () => {
      const res = await axios.get(
        `/api/performance-goals/employee/${session?.user.id}?status=${status}`
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: counts = {}, isLoading: loadingCounts } = useQuery({
    queryKey: ["goals-counts", status],
    queryFn: async () => {
      const res = await axios.get(
        `/api/performance-goals/status-counts/employee/${session?.user.id}`
      );
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  if (status === "loading" || isLoading || loadingCounts) return <Loading />;
  if (isError) return <p>Error loading data</p>;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Goals"
        description="Manage your performance goals effectively."
        icon={<TbTarget />}
      >
        <Button onClick={() => setOpen(true)}>
          <FaPlusCircle className="w-4 h-4 mr-2" /> Create Goal
        </Button>
      </PageHeader>

      <Tabs value={status} onValueChange={setStatus} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="published">
            <FaListUl className="w-4 h-4 mr-2 text-monzo-brandDark" />
            Active
            {counts?.active > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.active}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="incomplete">
            <FaTasks className="w-4 h-4 mr-2 text-monzo-secondary" />
            Incomplete
            {counts?.incomplete > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-secondary">
                {counts?.incomplete}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="completed">
            <FaCheck className="w-4 h-4 mr-2 text-monzo-error" />
            Completed
            {counts?.completed > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-error">
                {counts?.completed}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="overdue">
            <FaClock className="w-4 h-4 mr-2 text-monzo-success" />
            Overdue
            {counts?.overdue > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-success">
                {counts?.overdue}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="archived">
            <FaArchive className="w-4 h-4 mr-2 text-monzo-monzoGreen" />
            Archived
            {counts?.archived > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-monzoGreen">
                {counts?.archived}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TabsContent is technically not required here since we’re filtering inline */}
        <div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : (
            <GoalList goals={goals} />
          )}
        </div>
      </Tabs>
      <GoalModal open={open} setOpen={setOpen} />
    </section>
  );
}
