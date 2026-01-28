"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeesTable } from "@/features/employees/core/ui/employees.table";
import { Button } from "@/shared/ui/button";
import { Upload } from "lucide-react";
import { EmployeesCards } from "@/features/employees/core/ui/employee.card";
import { Employee } from "@/types/employees.type";
import AddMultipleEmployeesModal from "./AddMultipleEmployeesModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useSession } from "next-auth/react";
import { isAxiosError } from "@/lib/axios";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa6";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import EmptyState from "@/shared/ui/empty-state";
import { SendOnboardingInviteSheet } from "../onboarding/_components/SendOnboardingInviteSheet";
import { HiUsers } from "react-icons/hi2";

const Employees = () => {
  const [isMultipleOpen, setIsMultipleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/api/employees/all");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
    }
  };

  const {
    data: employees,
    isLoading: loadingEmployees,
    isError: errorEmployees,
  } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  if (status === "loading" || loadingEmployees) return <Loading />;
  if (errorEmployees) return <p>Error loading data</p>;

  const allEmployees = Array.isArray(employees) ? employees : [];

  // ✅ unique roles present in data
  const roles = Array.from(
    new Set(allEmployees.map((e) => e.role).filter(Boolean)),
  ).sort();

  // ✅ tab keys
  const statuses = Array.from(
    new Set(allEmployees.map((e) => e.employmentStatus).filter(Boolean)),
  ).sort();

  // ✅ tab keys
  const tabs = ["all", ...statuses];

  // ✅ filter by status
  const dataByTab = (tab: string) =>
    tab === "all"
      ? allEmployees
      : allEmployees.filter((e) => e.employmentStatus === tab);

  // ✅ human-friendly labels
  const statusLabel: Record<string, string> = {
    active: "Active",
    probation: "Probation",
    on_leave: "On Leave",
    onboarding: "Onboarding",
    inactive: "Inactive",
    resigned: "Resigned",
    terminated: "Terminated",
  };

  return (
    <section className="p-5">
      <PageHeader
        title="Employees"
        description="Manage your employees and their information."
      >
        <SendOnboardingInviteSheet />

        <Button onClick={() => setIsMultipleOpen(true)}>
          <Upload size={16} />
          Upload Employees
        </Button>

        <Link href="/dashboard/employees/invite">
          <Button>
            <FaUserPlus size={16} />
            Add Employees
          </Button>
        </Link>
      </PageHeader>

      {/* Conditionally rendered Employee Cards above Tabs */}
      {allEmployees.length > 0 && (
        <div className="mt-6">
          <EmployeesCards data={dataByTab(activeTab)} />
        </div>
      )}

      {allEmployees.length === 0 ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Employees Found"
            description="It seems you haven't added any employees yet. Start by adding your first employee."
            icon={<HiUsers />}
          />
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mt-5 flex flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab === "all" ? "All" : (statusLabel[tab] ?? tab)}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <EmployeesTable data={dataByTab(tab)} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AddMultipleEmployeesModal
        isOpen={isMultipleOpen}
        onClose={() => setIsMultipleOpen(false)}
      />
    </section>
  );
};

export default Employees;
