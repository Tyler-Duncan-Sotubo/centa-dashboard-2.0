"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import RoleList from "../framework/_components/RoleList";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import Loading from "@/shared/ui/loading";
import { JobRole } from "@/types/job-roles.type";
import RoleCompetencyModal from "./_components/RoleCompetencyModal";
import { Expectation } from "@/types/performance/framework.type";
import ExpectationsList from "./_components/ExpectationsList";

interface FrameworkSettings {
  roles: JobRole[];
  expectationsByRole: Record<string, Expectation[]>;
}

export default function PerformanceFramework() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [activeRoleId, setActiveRoleId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: framework,
    isLoading,
    isError,
  } = useQuery<FrameworkSettings>({
    queryKey: ["framework-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-seed/framework");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  useEffect(() => {
    if (framework?.roles?.length && !activeRoleId) {
      setActiveRoleId(framework.roles[0].id);
    }
  }, [framework, activeRoleId]);

  if (isLoading) return <Loading />;
  if (isError || !framework) return <p>Error loading framework settings.</p>;

  const activeRole = framework.roles.find((r) => r.id === activeRoleId);
  const expectations = framework.expectationsByRole[activeRoleId] || [];

  return (
    <section className="mb-20 px-4">
      <PageHeader
        title="Performance Framework"
        description="Define expected competency levels per job role."
      />

      <div className="grid grid-cols-3 gap-6 mt-10 items-start">
        <RoleList
          roles={framework.roles}
          activeRoleId={activeRoleId}
          onSelect={(id) => setActiveRoleId(id)}
        />

        {/* Expectations Viewer */}
        <ExpectationsList
          roleTitle={activeRole?.title || "Select a role"}
          roleId={activeRoleId}
          expectations={expectations}
        />
      </div>

      <RoleCompetencyModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        roleId={activeRoleId}
      />
    </section>
  );
}
