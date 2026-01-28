"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useMemo, useState } from "react";
import { Skeleton } from "@/shared/ui/skeleton";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import GoalModal from "./_components/GoalFormModal";
import Loading from "@/shared/ui/loading";
import { TbTarget } from "react-icons/tb";
import GoalList from "./_components/GoalList";
import { FilterChips } from "@/shared/ui/filter-chips";

type GoalStatus =
  | "published"
  | "incomplete"
  | "completed"
  | "overdue"
  | "archived";

export default function GoalsPage() {
  const [status, setStatus] = useState<GoalStatus>("published");
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
        `/api/performance-goals/employee/${session?.user.id}?status=${status}`,
      );
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const { data: counts = {}, isLoading: loadingCounts } = useQuery({
    queryKey: ["goals-counts"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/performance-goals/status-counts/employee/${session?.user.id}`,
      );
      return res.data.data;
    },
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const chips = useMemo(
    () =>
      [
        {
          value: "published",
          label: "Active",
          count: (counts as any)?.active ?? 0,
        },
        {
          value: "incomplete",
          label: "Incomplete",
          count: (counts as any)?.incomplete ?? 0,
        },
        {
          value: "completed",
          label: "Completed",
          count: (counts as any)?.completed ?? 0,
        },
        {
          value: "overdue",
          label: "Overdue",
          count: (counts as any)?.overdue ?? 0,
        },
        {
          value: "archived",
          label: "Archived",
          count: (counts as any)?.archived ?? 0,
        },
      ] satisfies { value: GoalStatus; label: string; count?: number }[],
    [counts],
  );

  if (isLoading || loadingCounts) return <Loading />;
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

      <Tabs
        value={status}
        onValueChange={(v) => setStatus(v as GoalStatus)}
        className="space-y-4"
      >
        {/* ✅ Mobile filter chips */}
        <FilterChips<GoalStatus>
          value={status}
          onChange={setStatus}
          chips={chips}
          scrollable
          className="sm:hidden"
        />

        {/* ✅ Desktop tabs */}
        <TabsList className="hidden sm:grid w-full grid-cols-5">
          <TabsTrigger value="published">
            <FaListUl className="w-4 h-4 mr-2 text-monzo-brandDark" />
            Active
            {(counts as any)?.active > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {(counts as any)?.active}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="incomplete">
            <FaTasks className="w-4 h-4 mr-2 text-monzo-secondary" />
            Incomplete
            {(counts as any)?.incomplete > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-secondary">
                {(counts as any)?.incomplete}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="completed">
            <FaCheck className="w-4 h-4 mr-2 text-monzo-error" />
            Completed
            {(counts as any)?.completed > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-error">
                {(counts as any)?.completed}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="overdue">
            <FaClock className="w-4 h-4 mr-2 text-monzo-success" />
            Overdue
            {(counts as any)?.overdue > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-success">
                {(counts as any)?.overdue}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="archived">
            <FaArchive className="w-4 h-4 mr-2 text-monzo-monzoGreen" />
            Archived
            {(counts as any)?.archived > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-monzoGreen">
                {(counts as any)?.archived}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Content */}
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
