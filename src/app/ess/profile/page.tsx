/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { HistoryCard } from "./_components/personal/HistoryCard";
import { CertificationsCard } from "./_components/personal/CertificationsCard";
import { FamilyCard } from "./_components/personal/FamilyCard";
import { CompensationCard } from "./_components/jobs/CompensationCard";
import { FinancialsCard } from "./_components/jobs/FinancialsCard";
import { EmploymentDetailsCard } from "./_components/jobs/EmploymentDetailsCard";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PayslipDetailsTable from "./_components/PayslipDetails";
import { ProfileCard } from "./_components/personal/ProfileCard";
import PageHeader from "@/shared/ui/page-header";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { FiUser, FiBriefcase, FiCreditCard, FiFileText } from "react-icons/fi";
import { FilterChip, FilterChips } from "@/shared/ui/filter-chips";
import { OrgChartEmployeeFocus } from "@/features/company/org-chart/ui/OrgChartEmployeeFocus";

type TabKey = "personal" | "job" | "payroll" | "org-chart";

function useEmployeeSection(params: {
  employeeId: string; // ✅ backend employee id (NOT user.id)
  sections: string;
  enabled: boolean;
  month?: string;
}) {
  const { employeeId, sections, enabled, month } = params;
  const axios = useAxiosAuth();

  return useQuery({
    queryKey: ["employee", employeeId, sections, month],
    enabled: enabled && !!employeeId,
    queryFn: async () => {
      const res = await axios.get(`/api/employees/${employeeId}/full`, {
        params: { sections, month },
      });
      return res.data.data.data as Record<string, unknown>;
    },
  });
}

const EmployeeDetailPageDemo = () => {
  const { data: session, status } = useSession();
  const [tab, setTab] = React.useState<TabKey>("personal");

  const tabChips = React.useMemo(
    () =>
      [
        { value: "personal", label: "Personal" },
        { value: "job", label: "Employment" },
        { value: "payroll", label: "Payroll" },
        { value: "org-chart", label: "Org Chart" },
      ] satisfies { value: TabKey; label: string }[],
    [],
  );

  const chips = tabChips as unknown as FilterChip<TabKey>[];

  // ✅ Session readiness gates
  const isAuthed = status === "authenticated";
  const hasAccessToken = !!session?.backendTokens?.accessToken;

  // ✅ Keep BOTH IDs
  const userId = session?.user?.id ?? ""; // auth user id
  const employeeId = (session as any)?.employeeId ?? ""; // employee id (different from user.id)

  // ✅ Only run queries when session is ready + token + employeeId
  const canFetch = isAuthed && hasAccessToken && !!employeeId;

  const personalQ = useEmployeeSection({
    employeeId,
    sections: "core,profile,history,dependents,certifications",
    enabled: canFetch,
  });

  const jobQ = useEmployeeSection({
    employeeId,
    sections: "compensation,finance",
    enabled: canFetch && !!personalQ.data && tab === "job",
  });

  const payrollQ = useEmployeeSection({
    employeeId,
    sections: "payslip",
    enabled: canFetch && !!personalQ.data && tab === "payroll",
  });

  // If you don't have these tabs, remove them. Kept disabled to avoid accidental calls.
  const leaveQ = useEmployeeSection({
    employeeId,
    sections: "leave",
    enabled: false,
  });

  const attendanceQ = useEmployeeSection({
    employeeId,
    sections: "attendance",
    enabled: false,
  });

  // ✅ Don’t render data UI until session is resolved
  if (status === "loading") return <Loading />;

  // ✅ Don’t allow queries / rendering if not authenticated
  if (!isAuthed || !hasAccessToken) return <p>Not authenticated</p>;

  // ✅ If authenticated but missing employeeId, show a clear error (prevents calls)
  if (!employeeId) return <p>Missing employee id</p>;

  // ✅ Now safe to check query states
  if (personalQ.isLoading) return <Loading />;
  if (personalQ.isError) return <p>Error loading employee</p>;

  const data = {
    ...(personalQ.data || {}),
    ...(jobQ.data || {}),
    ...(payrollQ.data || {}),
    ...(leaveQ.data || {}),
    ...(attendanceQ.data || {}),
  } as any;

  const avatarUrl = data.avatarUrl ?? data.core?.avatarUrl ?? null;

  return (
    <div className="mb-20 space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage employee details, job information, payroll, and more."
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="space-y-4"
      >
        <FilterChips<TabKey>
          value={tab}
          onChange={setTab}
          chips={chips}
          scrollable
          className="sm:hidden"
        />

        <TabsList className="hidden sm:flex">
          <TabsTrigger value="personal" icon={<FiUser size={16} />}>
            Personal
          </TabsTrigger>
          <TabsTrigger value="job" icon={<FiBriefcase size={16} />}>
            Employment
          </TabsTrigger>
          <TabsTrigger value="payroll" icon={<FiCreditCard size={16} />}>
            Payroll
          </TabsTrigger>
          <TabsTrigger value="org-chart" icon={<FiFileText size={16} />}>
            Org Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <ProfileCard
            profile={data.profile}
            core={data.core}
            avatarUrl={avatarUrl}
          />
          <HistoryCard history={data.history} employeeId={userId} />
          <div className="grid gap-4 md:grid-cols-2">
            <FamilyCard family={data.dependents} employeeId={userId} />
            <CertificationsCard
              certifications={data.certifications}
              employeeId={userId}
            />
          </div>
        </TabsContent>

        <TabsContent value="job" className="space-y-6">
          {jobQ.isLoading ? (
            <Loading />
          ) : (
            <>
              <EmploymentDetailsCard details={data.core} employeeId={userId} />
              <div className="grid gap-4 md:grid-cols-2">
                <CompensationCard
                  compensations={data.compensation}
                  employeeId={userId}
                />
                <FinancialsCard financials={data.finance} employeeId={userId} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="payroll">
          {payrollQ.isLoading ? (
            <Loading />
          ) : (
            <PayslipDetailsTable payslipSummary={data.payslipSummary} />
          )}
        </TabsContent>

        <TabsContent value="org-chart">
          <OrgChartEmployeeFocus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetailPageDemo;
