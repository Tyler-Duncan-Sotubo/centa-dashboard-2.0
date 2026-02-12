"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import EmployeeQuickProfile from "./EmployeeQuickProfile";
import Loading from "@/shared/ui/loading";

export default function EmployeeProfileModal({
  employeeId,
  open,
  onOpenChange,
}: {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const axiosInstance = useAxiosAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["employee-card", employeeId],
    enabled: open && !!employeeId,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/employees/employee-card/${employeeId}`,
      );
      return res.data.data;
    },
  });

  if (isLoading) return <Loading />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[85%]">
        <DialogHeader>
          <DialogTitle className="sr-only">Employee Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <EmployeeQuickProfile employee={data ?? null} />
        )}
      </DialogContent>
    </Dialog>
  );
}
