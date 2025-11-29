/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HistoryCard } from "./_components/personal/HistoryCard";
import { CertificationsCard } from "./_components/personal/CertificationsCard";
import { FamilyCard } from "./_components/personal/FamilyCard";
import { CompensationCard } from "./_components/jobs/CompensationCard";
import { FinancialsCard } from "./_components/jobs/FinancialsCard";
import { EmploymentDetailsCard } from "./_components/jobs/EmploymentDetailsCard";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PayslipDetailsTable from "./_components/PayslipDetails";
import { ProfileCard } from "./_components/personal/ProfileCard";
import PageHeader from "@/components/pageHeader";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { FiUser, FiBriefcase, FiCreditCard, FiFileText } from "react-icons/fi";

const EmployeeDetailPageDemo = () => {
  const { data: session, status } = useSession();
  const [tab, setTab] = React.useState("personal");

  function useEmployeeSection(
    id: string,
    sections: string,
    enabled: boolean,
    month?: string
  ) {
    const axios = useAxiosAuth();
    return useQuery({
      queryKey: ["employee", id, sections, month],
      enabled,
      queryFn: async () => {
        const res = await axios.get(`/api/employees/${session?.user.id}/full`, {
          params: { sections, month },
        });
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
    enabled
  );

  // 2) Lazy load the rest per tab
  const jobQ = useEmployeeSection(
    userId,
    "compensation,finance",
    !!personalQ.data && tab === "job"
  );

  const payrollQ = useEmployeeSection(
    userId,
    "payslip",
    !!personalQ.data && tab === "payroll"
  );

  const leaveQ = useEmployeeSection(
    userId,
    "leave",
    !!personalQ.data && tab === "leave"
  );

  const attendanceQ = useEmployeeSection(
    userId,
    "attendance",
    !!personalQ.data && tab === "attendance"
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
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal" icon={<FiUser size={16} />}>
            Personal
          </TabsTrigger>
          <TabsTrigger value="job" icon={<FiBriefcase size={16} />}>
            Employment
          </TabsTrigger>
          <TabsTrigger value="payroll" icon={<FiCreditCard size={16} />}>
            Payroll
          </TabsTrigger>
          <TabsTrigger value="documents" icon={<FiFileText size={16} />}>
            Documents
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
        {/* Documents */}
        <TabsContent value="documents"></TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetailPageDemo;
