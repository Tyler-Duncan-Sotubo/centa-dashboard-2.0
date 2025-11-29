"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Settings } from "lucide-react";
import Loading from "../ui/loading";
import PageHeader from "../pageHeader";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { FaRegSquareCheck } from "react-icons/fa6";

export type TaskStatus = "todo" | "inProgress" | "done" | "skipped" | "blocked";

export type ChecklistResponse = {
  tasks: Record<string, TaskStatus>;
  required: string[];
  completed: boolean;
  disabledWhenComplete: boolean;
};

export type TaskMeta = {
  /** Human label shown in the list */
  label: string;
  /** Short description shown under the label */
  description?: string;
  /** Icon component (lucide/react-icons/etc.) */
  icon?: React.ElementType;
  /** Optional deep link to navigate on click */
  url?: string;
  /** Explicitly mark required; if omitted we’ll infer from API “required” array */
  required?: boolean;
  /** lightweight flags; we'll use "extra" to mark optional payroll extras */
  tags?: string[]; // e.g. ["extra"]
};

type ChecklistCardProps = {
  /** Title for the card header */
  title: string;
  /** API path to fetch checklist payload (e.g. "/api/checklist/payroll/progress") */
  fetchUrl: string;
  /** React Query key to cache this checklist */
  queryKey: (string | number)[];
  /** Map of metadata by task key */
  taskMeta: Record<string, TaskMeta>;
  /** Show the module-complete banner (default true) */
  showCompleteBanner?: boolean;
  /** If true, query waits for session token */
  requireSessionToken?: boolean;
};

function StatusPill({ status }: { status: TaskStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center text-emerald-600">
        <FaRegSquareCheck className="mr-1 h-8 w-8" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-muted-foreground">
      <ChevronRight className="mr-1 h-8 w-8" />
    </span>
  );
}

export default function ChecklistCard({
  title,
  fetchUrl,
  queryKey,
  taskMeta,
  requireSessionToken = true,
}: ChecklistCardProps) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const fetchChecklist = async (): Promise<ChecklistResponse | null> => {
    try {
      const res = await axios.get(fetchUrl);
      return res.data.data as ChecklistResponse;
    } catch (error) {
      if (isAxiosError(error) && error.response) return null;
      return null;
    }
  };

  const enabled = requireSessionToken
    ? !!session?.backendTokens?.accessToken
    : true;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchChecklist,
    enabled,
  });

  const updateExtraDone = useUpdateMutation({
    endpoint: "/api/checklist/done",
    refetchKey: queryKey.map((k) => k.toString()).join(" "),
  });
  const handleMarkExtraDone = async (key: string) => {
    await updateExtraDone({ key });
  };

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>Couldn’t load checklist.</CardContent>
      </Card>
    );
  }

  const { tasks = {}, required = [] } = data || {};

  // Normalize entries and sort: required first, then optional
  const entries = Object.entries(tasks).map(([key, status]) => {
    const meta = taskMeta[key] ?? {
      label: key,
      description: "—",
      icon: Settings,
    };
    const Icon = meta.icon ?? Settings;
    const isRequired = meta.required ?? required.includes(key);
    return { key, status, meta, Icon, isRequired };
  });

  // preserve API order
  const sorted = entries;

  return (
    <div className="px-5 space-y-6 mb-20 pt-6">
      <PageHeader
        title={title}
        description="In order to properly setup your account, we recommend you review the items below in the proposed order."
      />
      {!isLoading && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y">
              {sorted.map(({ key, status, meta, Icon, isRequired }) => {
                const isExtra = meta.tags?.includes("extra") ?? false;
                const line = (
                  <div className="flex items-start gap-4 p-4">
                    {/* Standalone icon */}
                    <div className="mt-0.5 shrink-0">
                      <Icon
                        className={`h-10 w-10 opacity-80 ${
                          status === "done"
                            ? "text-monzo-success"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    {/* Text block */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium w-[20%]">
                          {meta.label}
                        </span>
                        {isRequired && (
                          <Badge variant="completed">Required</Badge>
                        )}
                      </div>
                      {meta.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {meta.description}
                        </p>
                      )}
                    </div>

                    {/* Right-side status (check or arrow only) */}
                    <div className="mt-0.5 shrink-0">
                      <StatusPill status={status} />
                    </div>
                  </div>
                );

                // If it's an extra and not done yet, clicking should mark it done immediately.
                if (isExtra && status !== "done") {
                  return (
                    <li key={key}>
                      <Link
                        href={meta.url ?? "#"}
                        className="block transition hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => handleMarkExtraDone(key)}
                      >
                        {line}
                      </Link>
                    </li>
                  );
                }

                // If url present, make whole row a link (accessible)
                return meta.url ? (
                  <li key={key}>
                    <Link
                      href={meta.url}
                      className="block transition hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {line}
                    </Link>
                  </li>
                ) : (
                  <li key={key}>{line}</li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
