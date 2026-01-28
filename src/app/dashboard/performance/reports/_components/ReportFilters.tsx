/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import Loading from "@/shared/ui/loading";
import { useSession } from "next-auth/react";
import { ExportMenu } from "@/shared/ui/export-menu";

type Option = { id: string; name: string };

type ReportFiltersProps = {
  filters: Record<string, any>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onApply: () => void;
  exportPath?: string;
  allowedFormats?: ("csv" | "pdf" | "excel")[];
  appraisal?: boolean; // If true, show appraisal-specific filters
  // Control which filters appear:
  showCycle?: boolean;
  showDepartment?: boolean;
  showEmployee?: boolean;
  showType?: boolean;
  showMinimumScore?: boolean;
  showSearch?: boolean;
  // For edge-cases (like adding extra filters)
  children?: React.ReactNode;
};

export function ReportFilters({
  filters,
  setFilters,
  onApply,
  exportPath,
  appraisal = false,
  allowedFormats = ["csv", "pdf"],
  showCycle = true,
  showDepartment = true,
  showEmployee = true,
  showType = false,
  showMinimumScore = false,
  showSearch = true,
  children,
}: ReportFiltersProps) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  // Get all options at once (for performance)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports-filters"],
    queryFn: async () => {
      const res = await axios.get("/api/performance-report/reports-filters");
      return res.data.data;
    },
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 3600 * 1000, // 1 hour
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading report filters</div>;

  const {
    cycles = [],
    employeesList = [],
    departmentsList = [],
    appraisalCycles = [],
  } = data || {};

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <form
        className="flex flex-wrap gap-4 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
      >
        {showSearch && (
          <div>
            <label className="block mb-1 text-xs font-medium">Search</label>
            <Input
              type="text"
              placeholder="Search.. by name, department, etc."
              value={filters.search ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  search: e.target.value || undefined,
                }))
              }
              className="w-[230px]"
            />
          </div>
        )}
        {showCycle && (
          <div>
            <label className="block mb-1 text-xs font-medium">Cycle</label>
            <Select
              value={filters.cycleId ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  cycleId: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All Cycles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                {appraisal
                  ? appraisalCycles.map((opt: Option) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))
                  : cycles.map((opt: Option) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showEmployee && (
          <div>
            <label className="block mb-1 text-xs font-medium">Employee</label>
            <Select
              value={filters.employeeId ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  employeeId: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employeesList.map((opt: Option) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showDepartment && (
          <div>
            <label className="block mb-1 text-xs font-medium">Department</label>
            <Select
              value={filters.departmentId ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  departmentId: v === "all" ? undefined : v,
                }))
              }
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsList.map((opt: Option) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showType && (
          <div>
            <label className="block mb-1 text-xs font-medium">Type</label>
            <Select
              value={filters.type ?? "peer"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  type: v,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="manager_to_employee">
                  Manager to Employee
                </SelectItem>
                <SelectItem value="employee_to_manager">
                  Employee to Manager
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {showMinimumScore && (
          <div>
            <label className="block mb-1 text-xs font-medium">
              Minimum Score
            </label>
            <Input
              type="number"
              min={0}
              value={filters.minimumScore ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minimumScore: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              placeholder="Min score"
              className="w-[110px]"
            />
          </div>
        )}

        {children}
        {/* <Button type="submit">Apply</Button> */}
      </form>
      {exportPath && (
        <ExportMenu
          exportPath={exportPath}
          query={filters as Record<string, string | undefined>}
          allowedFormats={allowedFormats}
        />
      )}
    </div>
  );
}
