/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import { HelpCircle } from "lucide-react";
import PageHeader from "./pageHeader";

// ----- Types from backend -----
type TaskStatus = "todo" | "inProgress" | "done" | "skipped" | "blocked";
type ModuleBlob = {
  tasks: Record<string, TaskStatus>;
  required: string[];
  completed: boolean;
  disabledWhenComplete?: boolean;
};

// ----- Reusable component types -----
export type StepMetaItem = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  Component:
    | React.ComponentType<{ refresh: () => Promise<void> }>
    | React.ComponentType<any>;
};

type Props = {
  title: string; // e.g. "Payroll Onboarding"
  fetchUrl: string; // e.g. "api/company-settings/onboarding-progress/payroll"
  order: readonly string[]; // ordered step keys
  stepMeta: Record<string, StepMetaItem>;
  queryKey?: (string | number)[]; // override react-query key if needed
};

export default function OnboardingModule({
  title,
  fetchUrl,
  order,
  stepMeta,
  queryKey = ["onboarding", fetchUrl],
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  // fetcher
  const fetchModule = async (): Promise<ModuleBlob> => {
    try {
      const res = await axios.get(
        `api/company-settings/onboarding-progress/${fetchUrl}`
      );
      return res.data?.data ?? res.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new Error(err.response.data?.message || "Failed to load");
      }
      throw err;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchModule,
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnWindowFocus: true,
  });

  // local “page” override (no writes)
  const [overrideKey, setOverrideKey] = React.useState<string | null>(null);

  // Only keep steps present in payload & registry
  const ordered = order.filter((k) => k in (data?.tasks || {}) && stepMeta[k]);

  // Earliest unfinished step from server
  const firstNotDone =
    ordered.find(
      (k) => !["done", "skipped"].includes(data?.tasks?.[k] ?? "")
    ) ?? null;

  // If override tries to jump past unfinished, snap back
  React.useEffect(() => {
    if (!firstNotDone) {
      setOverrideKey(null);
      return;
    }
    const unfinishedIdx = ordered.indexOf(firstNotDone);
    if (overrideKey) {
      const overrideIdx = ordered.indexOf(overrideKey);
      if (overrideIdx === -1 || overrideIdx > unfinishedIdx) {
        setOverrideKey(firstNotDone);
      }
    }
  }, [firstNotDone, overrideKey, ordered]);

  const currentKey =
    overrideKey ?? firstNotDone ?? ordered[ordered.length - 1] ?? null;

  const total = ordered.length;
  const doneCount = ordered.filter((k) =>
    ["done", "skipped"].includes(data?.tasks?.[k] ?? "")
  ).length;
  const progressPct = Math.round((doneCount / Math.max(1, total)) * 100);

  const meta = currentKey ? stepMeta[currentKey] : undefined;
  const Current = meta?.Component ?? (() => null);

  const canNext =
    currentKey && data && data.tasks
      ? ["done", "skipped"].includes(data.tasks[currentKey])
      : false;

  const goNext = () => {
    if (!currentKey || !canNext) return;
    const idx = ordered.indexOf(currentKey);
    const nextKey = ordered[idx + 1];
    setOverrideKey(nextKey ?? null);
  };

  if (isLoading) return <Loading />;
  if (error || !data) {
    return (
      <div className="text-sm text-red-600 border p-3 rounded-lg">
        Couldn’t load {title.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="px-5">
      <PageHeader
        title={title}
        description={`Complete the steps below to set up ${title.toLowerCase()}.`}
      />
      <div className="gap-6">
        {/* Sidebar: vertical step list with icons (Monzo-themed) */}
        <aside className="mt-10 flex">
          <div className="sticky top-10 space-y-4">
            {/* Header / Progress */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Steps</h2>
                <p className="text-xs text-monzo-textSecondary">
                  {doneCount} of {total} completed
                </p>
              </div>
              <Progress value={progressPct} className="h-2 bg-monzo-innerBg" />
            </div>

            {/* Steps */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide max-w-[calc(100vw-2rem)]">
              {ordered.map((k) => {
                const metaItem = stepMeta[k];
                const StepIcon = metaItem?.Icon ?? HelpCircle;

                const finished = ["done", "skipped"].includes(data.tasks[k]);
                const active = k === currentKey;
                const locked =
                  !finished &&
                  ordered.indexOf(k) >
                    ordered.findIndex(
                      (x) => !["done", "skipped"].includes(data.tasks[x])
                    );
                const canNavigate = active || finished;

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => canNavigate && setOverrideKey(k)}
                    disabled={!canNavigate}
                    className={[
                      "w-full text-left rounded-xl px-4 py-3 transition flex items-center gap-3",
                      active
                        ? "ring-2 ring-monzo-secondary bg-monzo-innerBg text-black"
                        : finished
                        ? "bg-monzo-background text-monzo-textPrimary"
                        : "bg-monzo-primary text-monzo-textSecondary opacity-70",
                    ].join(" ")}
                  >
                    {/* Icon bubble */}
                    <div
                      className={[
                        "inline-flex items-center justify-center w-10 h-10 rounded-full border",
                        active
                          ? "border-monzo-secondary bg-monzo-secondary text-monzo-primary"
                          : finished
                          ? "border-monzo-success bg-monzo-success text-white"
                          : "border-monzo-innerBg text-monzo-textSecondary",
                      ].join(" ")}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    {/* Texts */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {metaItem?.label ?? k.replaceAll("_", " ")}
                        </span>
                        {active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-monzo-secondary text-monzo-primary">
                            Current
                          </span>
                        )}
                        {locked && !active && !finished && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-monzo-error text-white">
                            Locked
                          </span>
                        )}
                        {finished && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-monzo-success text-white">
                            Done
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          active ? "text-black" : "text-monzo-textSecondary"
                        }`}
                      >
                        Step {ordered.indexOf(k) + 1} of {total}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right: step content + next */}
        <main className="lg:col-span-8 mt-10">
          <div>
            {currentKey ? (
              <>
                <Current refresh={() => refetch().then(() => {})} />
                <div className="mt-6 flex justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={goNext}
                    disabled={!canNext}
                    aria-disabled={!canNext}
                    title={
                      canNext
                        ? "Go to next step"
                        : "Complete this step to continue"
                    }
                  >
                    Next step
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No current step.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
