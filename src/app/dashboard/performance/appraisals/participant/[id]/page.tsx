"use client";

import BackButton from "@/shared/ui/back-button";
import Loading from "@/shared/ui/loading";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { use, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { FaUser, FaUserTie } from "react-icons/fa";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import ManagerAssignmentModal from "../../_components/ManagerAssignmentModal";
import { MdAssignmentAdd } from "react-icons/md";
import EntryForm from "../../_components/EmployeeEntryForm";
import ManagerEntryForm from "../../_components/ManagerEntryForm";
import EvaluationForm from "../../_components/EvaluationForm";
import CompletedAppraisalResult from "../../_components/CompletedAppraisalResult";
import { FaBriefcase, FaBuilding } from "react-icons/fa6";
import { RestartAppraisalButton } from "../../_components/RestartAppraisalButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ParticipantsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

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
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || isLoading || isLoadingEntries || isLoadingLevels)
    return <Loading />;
  if (isError || isErrorEntries || isErrorLevels)
    return <p className="p-4 text-red-600">Error loading form data</p>;

  return (
    <div className="px-4">
      <BackButton
        href={`/dashboard/performance/appraisals/${data?.cycleId}`}
        className="mb-4"
        label="Back to Appraisals"
      />

      <PageHeader
        title={`Appraisal for ${data?.employeeName}`}
        icon={<FaUser size={30} className="text-monzo-success" />}
        description="Review and manage appraisal details for the selected participant."
      >
        {data && data.finalScore ? (
          role === "super_admin" || role === "admin" ? (
            <RestartAppraisalButton appraisalId={id} />
          ) : null
        ) : (
          <Button onClick={() => setOpen(true)}>
            <MdAssignmentAdd />
            Reassign Manager
          </Button>
        )}
      </PageHeader>

      <div className="flex gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FaUserTie size={18} className="text-monzo-error" />
          <span className="font-medium">Manager:</span>
          <span className="font-bold">{data?.managerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBuilding size={18} className="text-muted-foreground" />
          <span className="font-medium">Department:</span>
          <span className="font-bold">{data?.departmentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBriefcase size={18} className="text-muted-foreground" />
          <span className="font-medium">Job Role:</span>
          <span className="font-bold">{data?.jobRoleName}</span>
        </div>
      </div>

      {data && data.finalScore ? (
        <CompletedAppraisalResult
          competencies={entries}
          finalScore={data.finalScore}
          recommendation={data.recommendation}
          finalNote={data.finalNote}
        />
      ) : (
        <Tabs defaultValue="employee" className="mt-6">
          <TabsList>
            <TabsTrigger value="employee">Employee Self</TabsTrigger>
            <TabsTrigger value="manager">Manager Evaluation</TabsTrigger>
            <TabsTrigger value="evaluation">Final Evaluation</TabsTrigger>
          </TabsList>

          <TabsContent value="employee">
            <EntryForm
              entries={entries}
              levels={levelOptions}
              appraisalId={id}
            />
          </TabsContent>

          <TabsContent value="manager">
            <ManagerEntryForm
              entries={entries}
              levels={levelOptions}
              appraisalId={id}
            />
          </TabsContent>

          <TabsContent value="evaluation">
            <EvaluationForm
              appraisalId={id}
              entries={entries}
              employeeName={data?.employeeName}
            />
          </TabsContent>
        </Tabs>
      )}

      <ManagerAssignmentModal
        open={open}
        setOpen={setOpen}
        appraisalId={id ?? ""}
        currentManagerId={data?.managerId}
      />
    </div>
  );
}
