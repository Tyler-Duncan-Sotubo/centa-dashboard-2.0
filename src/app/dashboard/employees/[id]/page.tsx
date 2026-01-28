/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import {
  FiUser,
  FiCreditCard,
  FiFileText,
  FiCalendar,
  FiClock,
  FiBriefcase,
} from "react-icons/fi";
import { ProfileCard } from "../_components/personal/ProfileCard";
import { HistoryCard } from "../_components/personal/HistoryCard";
import { CertificationsCard } from "../_components/personal/CertificationsCard";
import { FamilyCard } from "../_components/personal/FamilyCard";
import { CompensationCard } from "../_components/jobs/CompensationCard";
import { FinancialsCard } from "../_components/jobs/FinancialsCard";
import { EmploymentDetailsCard } from "../_components/jobs/EmploymentDetailsCard";
import Loading from "@/shared/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import LeaveBalanceAndRequest from "../_components/LeaveBalanceAndRequest";
import PayslipDetailsTable from "../_components/PayslipDetails";
import AttendanceComponent from "../_components/Attendance";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import BackButton from "@/shared/ui/back-button";

type Params = {
  params: Promise<{ id: string }>;
};

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
      const res = await axios.get(`/api/employees/${id}/full`, {
        params: { sections, month },
      });
      return res.data.data.data as Record<string, unknown>;
    },
    staleTime: 60_000,
  });
}

const EmployeeDetailPageDemo = ({ params }: Params) => {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const [tab, setTab] = React.useState("personal");
  const enabled = !!session?.backendTokens?.accessToken && !!id;

  // 1) Fetch everything needed for Personal tab up-front:
  // core, profile, history (education/employment), dependents (family), certifications
  const personalQ = useEmployeeSection(
    id,
    "core,profile,history,dependents,certifications",
    enabled,
  );

  // 2) Lazy load the rest per tab
  const jobQ = useEmployeeSection(
    id,
    "compensation,finance",
    !!personalQ.data && tab === "job",
  );

  const payrollQ = useEmployeeSection(
    id,
    "payslip",
    !!personalQ.data && tab === "payroll",
  );

  const leaveQ = useEmployeeSection(
    id,
    "leave",
    !!personalQ.data && tab === "leave",
  );

  const attendanceQ = useEmployeeSection(
    id,
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

  return (
    <div className="px-5 mb-20">
      <BackButton label="Back to Employees" href="/dashboard/employees" />
      <h1 className="text-2xl font-semibold">Employee Details</h1>

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
          <TabsTrigger value="leave" icon={<FiCalendar size={16} />}>
            Leave
          </TabsTrigger>
          <TabsTrigger value="attendance" icon={<FiClock size={16} />}>
            Attendance
          </TabsTrigger>
          <TabsTrigger value="documents" icon={<FiFileText size={16} />}>
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Personal: already fully available from first query */}
        <TabsContent value="personal" className="space-y-6">
          <ProfileCard profile={data.profile} core={data.core} />
          <HistoryCard history={data.history} employeeId={id} />
          <div className="grid gap-4 md:grid-cols-2">
            <FamilyCard family={data.dependents} employeeId={id} />
            <CertificationsCard
              certifications={data.certifications}
              employeeId={id}
            />
          </div>
        </TabsContent>

        {/* Employment */}
        <TabsContent value="job" className="space-y-6">
          {jobQ.isLoading ? (
            <Loading />
          ) : (
            <>
              <EmploymentDetailsCard
                details={data.core}
                employeeId={id}
                employeeName={`${data.core?.lastName ?? ""} ${
                  data.core?.firstName ?? ""
                }`}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <CompensationCard
                  compensations={data.compensation}
                  employeeId={id}
                />
                <FinancialsCard financials={data.finance} employeeId={id} />
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

        {/* Leave */}
        <TabsContent value="leave">
          {leaveQ.isLoading ? (
            <Loading />
          ) : (
            <LeaveBalanceAndRequest
              leaveBalance={data.leaveBalance}
              leaveRequests={data.leaveRequests}
            />
          )}
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          {attendanceQ.isLoading ? (
            <Loading />
          ) : (
            <AttendanceComponent attendance={data.attendance} />
          )}
        </TabsContent>

        {/* Stubs */}
        <TabsContent value="documents"></TabsContent>
        <TabsContent value="lifecycle"></TabsContent>
        <TabsContent value="benefits"></TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetailPageDemo;
