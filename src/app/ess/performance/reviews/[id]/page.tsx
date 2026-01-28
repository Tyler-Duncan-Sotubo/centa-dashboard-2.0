"use client";

import BackButton from "@/shared/ui/back-button";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/page-header";
import { FaUser, FaUserTie } from "react-icons/fa";
import { FaBriefcase, FaBuilding } from "react-icons/fa6";
import CompletedAppraisalResult from "../_components/CompletedAppraisalResult";
import EntryForm from "../_components/EmployeeEntryForm";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppraisalSelfPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["participants", id],
    queryFn: async () => {
      const res = await axios.get(`/api/appraisals/${id}`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken && !!id,
  });

  const {
    data: entries,
    isLoading: isLoadingEntries,
    isError: isErrorEntries,
  } = useQuery({
    queryKey: ["appraisal-entries", id],
    queryFn: async () =>
      (await axios.get(`/api/appraisals/${id}/entries`)).data.data,
    enabled: !!session?.backendTokens?.accessToken && !!id,
  });

  const {
    data: levelOptions,
    isLoading: isLoadingLevels,
    isError: isErrorLevels,
  } = useQuery({
    queryKey: ["competency-levels"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-seed/competency-levels");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (status === "loading" || isLoading || isLoadingEntries || isLoadingLevels)
    return <Loading />;
  if (isError || isErrorEntries || isErrorLevels)
    return <p className="p-4 text-red-600">Error loading appraisal</p>;

  // Show results when the manager has submitted OR appraisal is finalized.
  const showResults =
    !!data?.finalNote ||
    (!!data?.submittedByManager && !!data?.submittedByEmployee);

  return (
    <div className="mb-20">
      <BackButton
        href={`/ess/performance/reviews`}
        className="mb-4"
        label="Back to Appraisals"
      />

      <PageHeader
        title={`Your Appraisal`}
        icon={<FaUser size={30} className="text-monzo-success" />}
        description="Complete your self-assessment. You'll see results once your manager submits."
      />

      {/* Context strip */}
      <div className="flex gap-6 mt-6 flex-wrap">
        <div className="flex items-center gap-2">
          <FaUserTie size={18} className="text-monzo-error" />
          <span className="font-medium">Manager:</span>
          <span className="font-bold">{data?.managerName ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBuilding size={18} className="text-muted-foreground" />
          <span className="font-medium">Department:</span>
          <span className="font-bold">{data?.departmentName ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase size={18} className="text-muted-foreground" />
          <span className="font-medium">Job Role:</span>
          <span className="font-bold">{data?.jobRoleName ?? "—"}</span>
        </div>
      </div>

      {showResults ? (
        <CompletedAppraisalResult
          competencies={entries}
          finalScore={data.finalScore}
          recommendation={data.recommendation}
          finalNote={data.finalNote}
        />
      ) : (
        <div className="mt-16">
          <EntryForm entries={entries} levels={levelOptions} appraisalId={id} />
        </div>
      )}
    </div>
  );
}
