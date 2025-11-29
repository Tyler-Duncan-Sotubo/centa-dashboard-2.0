"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaUsers,
  FaUserFriends,
  FaUser,
  FaUserTie,
  FaArchive,
  FaListUl,
  FaBuilding,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/pageHeader";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "@/types/employees.type";
import { TbMessageCircle } from "react-icons/tb";
import FeedbackFormModal from "./_components/FeedbackFormModal";
import FeedbackTypeDropdown from "./_components/FeedbackTypeDropdown";
import FeedbackList from "./_components/FeedbackList";

type FeedbackType =
  | "self"
  | "peer"
  | "manager_to_employee"
  | "employee_to_manager"
  | "archived";

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackType | "all">("all");
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>("self");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [debouncedEmployeeFilter, setDebouncedEmployeeFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmployeeFilter(employeeFilter);
    }, 1000); // 400ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [employeeFilter]);

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

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: [
      "feedbacks",
      category,
      debouncedEmployeeFilter,
      departmentFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.append("type", category);
      if (debouncedEmployeeFilter.trim())
        params.append("employee", debouncedEmployeeFilter);
      if (departmentFilter !== "all")
        params.append("departmentId", departmentFilter);

      const res = await axios.get(`/api/feedback?${params.toString()}`);
      return res.data.data;
    },
    enabled: !!session?.backendTokens.accessToken,
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["feedback-settings"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback/settings");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  const { data: counts, isLoading: isLoadingCounts } = useQuery({
    queryKey: ["feedback-counts"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback/counts");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
  });

  if (isLoading || loadingDepartments || isLoadingSettings || isLoadingCounts)
    return <Loading />;
  if (errorDepartments) return <p>Error loading departments</p>;

  return (
    <section className="p-6 space-y-8">
      <PageHeader
        title="360° Feedback"
        description="Collect and manage feedback from all perspectives."
        icon={<TbMessageCircle />}
      >
        <div className="flex items-center space-x-2">
          <FeedbackTypeDropdown
            onSelect={(type) => {
              setSelectedType(type);
              setOpen(true);
            }}
            settings={settings}
            userRole={session?.user?.role || "employee"}
          />
        </div>
      </PageHeader>

      <div className="flex items-center gap-4 max-w-xl">
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
            <FaBuilding className="mr-2 w-4 h-4" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept: Department) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as "all" | FeedbackType)}
        className="space-y-4 mt-6"
      >
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">
            <FaUsers className="mr-2 w-4 h-4 text-monzo-brandDark" />
            All
            {counts?.all > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="peer">
            <FaUserFriends className="mr-2 w-4 h-4 text-monzo-secondary" />
            Peer
            {counts?.peer > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.peer}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="self">
            <FaUser className="mr-2 w-4 h-4 text-monzo-error" />
            Self
            {counts?.self > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.self}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="employee_to_manager">
            <FaUser className="mr-2 w-4 h-4 text-monzo-success" />
            Employee
            {counts?.employee_to_manager > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.employee_to_manager}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="manager_to_employee">
            <FaUserTie className="mr-2 w-4 h-4 text-monzo-monzoGreen" />
            Manager
            {counts?.manager_to_employee > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.manager_to_employee}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">
            <FaArchive className="mr-2 w-4 h-4 text-muted-foreground" />
            Archived
            {counts?.archived > 0 && (
              <span className="ml-2 text-xs bg-monzo-brandDark text-white px-1 rounded">
                {counts?.archived}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div>
          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FeedbackList feedbacks={feedbacks} />
          )}
        </div>
      </Tabs>

      <FeedbackFormModal
        open={open}
        setOpen={setOpen}
        type={
          selectedType as
            | "self"
            | "peer"
            | "manager_to_employee"
            | "employee_to_manager"
        }
      />
    </section>
  );
}
