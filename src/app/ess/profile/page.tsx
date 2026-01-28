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

const EmployeeDetailPageDemo = () => {
  const { data: session, status } = useSession();

  console.log("Session:", session);
  type TabKey = "personal" | "job" | "payroll" | "org-chart";
  const [tab, setTab] = React.useState("personal");

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

  function useEmployeeSection(
    id: string,
    sections: string,
    enabled: boolean,
    month?: string,
  ) {
    const axios = useAxiosAuth();
    return useQuery({
      queryKey: ["employee", id, sections, month],
      enabled,
      queryFn: async () => {
        const res = await axios.get(
          `/api/employees/${session?.employeeId}/full`,
          {
            params: { sections, month },
          },
        );
        return res.data.data.data as Record<string, unknown>;
      },
      staleTime: 60_000,
    });
  }

  const enabled = !!session?.backendTokens?.accessToken && !!session?.user.id;

  const userId = session?.user.id ?? "";

  const personalQ = useEmployeeSection(
    userId,
    "core,profile,history,dependents,certifications",
    enabled,
  );

  // 2) Lazy load the rest per tab
  const jobQ = useEmployeeSection(
    userId,
    "compensation,finance",
    !!personalQ.data && tab === "job",
  );

  const payrollQ = useEmployeeSection(
    userId,
    "payslip",
    !!personalQ.data && tab === "payroll",
  );

  const leaveQ = useEmployeeSection(
    userId,
    "leave",
    !!personalQ.data && tab === "leave",
  );

  const attendanceQ = useEmployeeSection(
    userId,
    "attendance",
    !!personalQ.data && tab === "attendance",
  );

  // Initial gate
  if (status === "loading" || personalQ.isLoading) return <Loading />;
  if (personalQ.isError) return <p>Error loading employee</p>;

  // Merge results
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
      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="space-y-4"
      >
        <FilterChips<TabKey>
          value={tab as TabKey}
          onChange={setTab} // ✅ now perfectly typed
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
        {/* Personal Info */}
        <TabsContent value="personal" className="space-y-6">
          <ProfileCard
            profile={data.profile}
            core={data.core}
            avatarUrl={avatarUrl}
          />
          <HistoryCard
            history={data.history}
            employeeId={session?.user.id as string}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FamilyCard
              family={data.dependents}
              employeeId={session?.user.id as string}
            />
            <CertificationsCard
              certifications={data.certifications}
              employeeId={session?.user.id as string}
            />
          </div>
        </TabsContent>
        <TabsContent value="job" className="space-y-6">
          {jobQ.isLoading ? (
            <Loading />
          ) : (
            <>
              <EmploymentDetailsCard
                details={data.core}
                employeeId={session?.user.id as string}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <CompensationCard
                  compensations={data.compensation}
                  employeeId={session?.user.id as string}
                />
                <FinancialsCard
                  financials={data.finance}
                  employeeId={session?.user.id as string}
                />
              </div>
            </>
          )}
        </TabsContent>
        {/* Payroll */}
        <TabsContent value="payroll">
          {payrollQ.isLoading ? (
            <Loading />
          ) : (
            <PayslipDetailsTable payslipSummary={data.payslipSummary} />
          )}
        </TabsContent>
        {/* Org Chart */}
        <TabsContent value="org-chart">
          <OrgChartEmployeeFocus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetailPageDemo;
