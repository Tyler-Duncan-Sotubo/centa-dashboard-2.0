"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaTasks,
  FaCheck,
  FaClock,
  FaArchive,
  FaListUl,
  FaPlusCircle,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import GoalList from "./_components/GoalList";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import GoalModal from "./_components/GoalFormModal";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Goal } from "@/types/performance/goals.type";
import { Department } from "@/types/employees.type";
import { TbTarget } from "react-icons/tb";
import { FaBuilding } from "react-icons/fa6";

export default function GoalsPage() {
  const [status, setStatus] = useState("published");
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", status],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-goals?status=${status}`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: counts = {}, isLoading: loadingCounts } = useQuery({
    queryKey: ["goals-counts", status],
    queryFn: async () => {
      const res = await axios.get(`/api/performance-goals/status-counts`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const {
    data: departments = [],
    isLoading: loadingDepartments,
    isError: errorDepartments,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/department`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredGoals = goals.filter((goal: Goal) => {
    const matchEmployee = employeeFilter
      ? goal.employee.toLowerCase().includes(employeeFilter.toLowerCase())
      : true;

    const matchDepartment =
      departmentFilter !== "all"
        ? goal.departmentName === departmentFilter
        : true;

    return matchEmployee && matchDepartment;
  });

  const showFiltered =
    employeeFilter.trim() !== "" || departmentFilter !== "all";

  if (status === "loading" || isLoading || loadingDepartments || loadingCounts)
    return <Loading />;
  if (errorDepartments) return <p>Error loading data</p>;

  return (
    <section className="p-6 space-y-8">
      <PageHeader
        title="Goals"
        description="Manage your performance goals effectively."
        icon={<TbTarget />}
      >
        <Button onClick={() => setOpen(true)}>
          <FaPlusCircle className="w-4 h-4 mr-2" /> Create Goal
        </Button>
      </PageHeader>

      <div className="flex items-center max-w-xl gap-4">
        <Input
          placeholder="Search employee"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="w-64"
          leftIcon={<FaListUl />}
        />

        <Select
          value={departmentFilter}
          onValueChange={(value) => setDepartmentFilter(value)}
        >
          <SelectTrigger className="w-96">
            <FaBuilding className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept: Department) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="published">
            <FaListUl className="w-4 h-4 mr-2 text-monzo-brandDark" />
            Active
            {counts?.active > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-brandDark">
                {counts?.active}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="incomplete">
            <FaTasks className="w-4 h-4 mr-2 text-monzo-secondary" />
            Incomplete
            {counts?.incomplete > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-secondary">
                {counts?.incomplete}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="completed">
            <FaCheck className="w-4 h-4 mr-2 text-monzo-error" />
            Completed
            {counts?.completed > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-error">
                {counts?.completed}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="overdue">
            <FaClock className="w-4 h-4 mr-2 text-monzo-success" />
            Overdue
            {counts?.overdue > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-success">
                {counts?.overdue}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="archived">
            <FaArchive className="w-4 h-4 mr-2 text-monzo-monzoGreen" />
            Archived
            {counts?.archived > 0 && (
              <span className="px-1 ml-2 text-xs text-white rounded bg-monzo-monzoGreen">
                {counts?.archived}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TabsContent is technically not required here since we’re filtering inline */}
        <div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          ) : (
            <GoalList goals={showFiltered ? filteredGoals : goals} />
          )}
        </div>
      </Tabs>
      <GoalModal open={open} setOpen={setOpen} />
    </section>
  );
}
