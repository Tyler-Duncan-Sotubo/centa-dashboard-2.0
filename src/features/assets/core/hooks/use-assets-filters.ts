"use client";

import { useMemo, useState } from "react";
import type { Asset } from "@/features/assets/core/types/asset.type";

const unique = (values: string[]) => Array.from(new Set(values));

export function useAssetsFilters(assets: Asset[] | undefined) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const statusOptions = useMemo(
    () => unique((assets ?? []).map((a) => a.status)),
    [assets],
  );
  const categoryOptions = useMemo(
    () => unique((assets ?? []).map((a) => a.category)),
    [assets],
  );
  const locationOptions = useMemo(
    () => unique((assets ?? []).map((a) => a.location)),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    return (assets ?? []).filter((asset) => {
      const statusMatch =
        statusFilter === "all" || asset.status === statusFilter;
      const categoryMatch =
        categoryFilter === "all" || asset.category === categoryFilter;
      const locationMatch =
        locationFilter === "all" || asset.location === locationFilter;

      return statusMatch && categoryMatch && locationMatch;
    });
  }, [assets, statusFilter, categoryFilter, locationFilter]);

  return {
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    locationFilter,
    setLocationFilter,

    statusOptions,
    categoryOptions,
    locationOptions,

    filteredAssets,
  };
}
