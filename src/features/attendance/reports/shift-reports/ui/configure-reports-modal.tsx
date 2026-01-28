"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import { Department } from "@/types/employees.type";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

type OfficeLocation = {
  id: string;
  name: string;
  country: string;
  street: string;
  city: string;
  state: string;
  longitude: string;
  latitude: string;
};

type ReportFilters = {
  yearMonth: string;
  locationId?: string;
  departmentId?: string;
};

export function ConfigureReportModal({
  open,
  onOpenChange,
  filters,
  setFilters,
  years,
  months,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ReportFilters;
  setFilters: (val: ReportFilters) => void;
  years: string[];
  months: string[];
}) {
  const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);
  const [year, month] = localFilters.yearMonth.split("-");

  useEffect(() => {
    if (open) setLocalFilters(filters);
  }, [open, filters]);

  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchOfficeLocations = async () => {
    const res = await axiosInstance.get("/api/locations");
    return res.data.data;
  };

  const {
    data: locations,
    isLoading: isLoadingLocations,
    isError: isErrorLocations,
  } = useQuery<OfficeLocation[]>({
    queryKey: ["office-locations"],
    queryFn: fetchOfficeLocations,
    enabled: !!session?.backendTokens?.accessToken && open,
  });

  const fetchDepartments = async (token: string) => {
    const res = await axiosInstance.get("/api/department", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  };

  const {
    data: departments,
    isLoading: loadingDepartments,
    isError: errorDepartments,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () =>
      fetchDepartments(session?.backendTokens?.accessToken as string),
    enabled: !!session?.backendTokens?.accessToken && open,
  });

  if (status === "loading" || isLoadingLocations || loadingDepartments)
    return <Loading />;
  if (isErrorLocations || errorDepartments)
    return <div className="text-red-500">Failed to load filters.</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Configure Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-5">
          <section className="grid grid-cols-2 items-center gap-4">
            <p className="text-md font-semibold">Month</p>
            <div className="flex gap-2">
              <Select
                value={year}
                onValueChange={(val) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    yearMonth: `${val}-${month}`,
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((yr) => (
                    <SelectItem key={yr} value={yr}>
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={month}
                onValueChange={(val) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    yearMonth: `${year}-${val}`,
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {new Date(`${year}-${m}-01`).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid grid-cols-2 items-center gap-4">
            <p className="text-md font-semibold">Work Location</p>
            <Select
              value={localFilters.locationId}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, locationId: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
          <section className="grid grid-cols-2 items-center gap-4">
            <p className="text-md font-semibold">Department</p>
            <Select
              value={localFilters.departmentId}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, departmentId: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        </div>

        <DialogFooter className="flex justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() =>
              setLocalFilters((prev) => ({
                ...prev,
                locationId: undefined,
                departmentId: undefined,
              }))
            }
          >
            Clear Filters
          </Button>

          <Button
            onClick={() => {
              setFilters(localFilters);
              onOpenChange(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
