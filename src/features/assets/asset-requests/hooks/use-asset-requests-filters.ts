"use client";

import { useMemo, useState } from "react";
import { AssetRequest } from "../types/asset-request.type";

const unique = (values: string[]) => Array.from(new Set(values));

export function useAssetRequestsFilters(requests: AssetRequest[] | undefined) {
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = useMemo(
    () => unique((requests ?? []).map((r) => r.status)),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    return (requests ?? []).filter((request) => {
      return statusFilter === "all" || request.status === statusFilter;
    });
  }, [requests, statusFilter]);

  return {
    statusFilter,
    setStatusFilter,
    statusOptions,
    filteredRequests,
  };
}
