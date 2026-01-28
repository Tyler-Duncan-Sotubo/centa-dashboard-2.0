"use client";

import { useMemo, useState } from "react";
import type { AssetReport } from "@/features/assets/assets-report/types/asset-report.type";

const unique = (values: string[]) => Array.from(new Set(values));

export function useAssetReportsFilters(reports: AssetReport[] | undefined) {
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = useMemo(
    () => unique((reports ?? []).map((r) => r.status)),
    [reports],
  );

  const filteredReports = useMemo(() => {
    return (reports ?? []).filter((report) => {
      return statusFilter === "all" || report.status === statusFilter;
    });
  }, [reports, statusFilter]);

  return {
    statusFilter,
    setStatusFilter,
    statusOptions,
    filteredReports,
  };
}
