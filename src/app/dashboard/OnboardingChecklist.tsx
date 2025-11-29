/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  BadgeDollarSign, // payroll
  Users, // staff
  LineChart, // performance
  Briefcase, // hiring
  Clock3, // attendance
  CalendarRange, // leave
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import Loading from "@/components/ui/loading";
import { axiosInstance } from "@/lib/axios";
import {
  OnboardingTaskKey,
  onboardingTaskLabels,
} from "@/constants/onboardingTasks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type OnboardingTask = {
  id: number;
  companyId: number;
  taskKey: string;
  completed: boolean;
  completedAt: Date | null;
};

// Optional modules config (shown under "Optional setup")
const OPTIONAL_MODULES = [
  {
    key: "performance",
    label: "Performance Setup",
    description: "General settings, goals, competencies, and templates.",
    url: "/dashboard/performance/checklist",
    Icon: LineChart,
  },
  {
    key: "hiring",
    label: "Hiring Setup",
    description: "Pipeline, scorecards, email/offer templates, jobs.",
    url: "/dashboard/recruitment/checklist",
    Icon: Briefcase,
  },
  {
    key: "attendance",
    label: "Attendance Setup",
    description: "General settings, shifts, rota, office locations.",
    url: "/dashboard/attendance/checklist",
    Icon: Clock3,
  },
  {
    key: "leave",
    label: "Time Off Setup",
    description: "Leave settings, types & policies, holidays, blocked days.",
    url: "/dashboard/leave/checklist",
    Icon: CalendarRange,
  },
] as const;

const OnboardingChecklist = ({
  onboardingTaskCompleted,
}: {
  onboardingTaskCompleted?: boolean;
}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [userDismissed, setUserDismissed] = useState(false);
  const isModalOpen = !onboardingTaskCompleted && !userDismissed;

  const {
    data: onboarding,
    isLoading,
    isError,
  } = useQuery<OnboardingTask[]>({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/company-settings/onboarding");
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken && !onboardingTaskCompleted,
  });

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    if (!onboarding || onboardingTaskCompleted) return;

    const entries = Object.entries(onboarding);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const completed = entries.filter(([_, isDone]) => isDone).length;
    const total = entries.length;

    setCompletedTasks(completed);
    setTotalTasks(total);
    setProgressPercentage(total ? (completed / total) * 100 : 0);

    if (completed === total && total > 0) {
      queryClient.invalidateQueries({ queryKey: ["companySummary"] });
    }
  }, [onboarding, onboardingTaskCompleted, queryClient]);

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading onboarding data</p>;

  const taskIcons: Partial<
    Record<OnboardingTaskKey, React.ComponentType<any>>
  > = {
    payroll: BadgeDollarSign,
    staff: Users,
  };

  return (
    <Drawer
      open={isModalOpen}
      onOpenChange={(open) => !open && setUserDismissed(true)}
    >
      <DrawerContent className="fixed left-2 top-0 w-[40%] bg-white shadow-lg border-r dark:bg-gray-900 z-50">
        <DrawerHeader className="flex items-center justify-between px-4 py-2 border-b">
          <DrawerTitle>Onboarding Checklist</DrawerTitle>
          <DrawerClose asChild>
            <button
              onClick={() => setUserDismissed(true)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="h-[calc(100%-56px)] p-4 overflow-y-auto">
          <section className="mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {completedTasks} of {totalTasks} tasks completed
            </p>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </section>

          <ul className="space-y-3 border p-3 rounded-lg">
            {Object.entries(onboarding || {}).map(([taskKey, completed]) => {
              const taskMeta =
                onboardingTaskLabels[
                  taskKey as keyof typeof onboardingTaskLabels
                ];
              const Icon = taskIcons[taskKey as keyof typeof taskIcons];
              return (
                <li
                  key={taskKey}
                  className="flex items-center justify-between px-3 py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={[
                        "inline-flex w-8 h-8 items-center justify-center rounded-full border",
                        completed
                          ? "bg-green-50 border-green-600 text-green-700"
                          : "bg-muted border-border text-foreground/60",
                      ].join(" ")}
                      aria-label={completed ? "Completed" : "Pending"}
                      title={completed ? "Completed" : "Pending"}
                    >
                      {Icon ? (
                        <Icon
                          className={`rounded-full p-1 w-7 h-7 ${
                            completed
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-md">
                        {taskMeta?.label || taskKey}
                      </div>
                      <div className="text-md text-muted-foreground max-w-[300px]">
                        {taskMeta?.description}
                      </div>
                    </div>
                  </div>
                  {completed ? (
                    <Badge variant="completed">Completed</Badge>
                  ) : (
                    <Link href={taskMeta?.url || "#"}>
                      <Badge variant="pending">Complete now</Badge>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Optional modules section */}
          <section className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Optional setup
            </h3>
            <ul className="space-y-3 border p-3 rounded-lg">
              {OPTIONAL_MODULES.map(
                ({ key, label, description, url, Icon }) => (
                  <li
                    key={key}
                    className="flex items-center justify-between px-3 py-2 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="inline-flex w-8 h-8 items-center justify-center rounded-full border bg-muted border-border text-foreground/60">
                        <Icon className="rounded-full p-1 w-7 h-7 bg-gray-200 text-black" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-md">{label}</div>
                        <div className="text-md text-muted-foreground max-w-[300px]">
                          {description}
                        </div>
                      </div>
                    </div>
                    <Link href={url}>
                      <Badge variant="outline">Optional</Badge>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OnboardingChecklist;
