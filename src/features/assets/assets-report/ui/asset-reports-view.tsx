"use client";

import React from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import EmptyState from "@/shared/ui/empty-state";

import { MdReport, MdReportProblem } from "react-icons/md";
import { BadgeCheck } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAssetReportsQuery } from "../hooks/use-asset-reports-query";
import { useAssetReportsFilters } from "../hooks/use-asset-reports-filters";
import { AssetReportColumns } from "./asset-report-columns";
import { FaClipboard } from "react-icons/fa6";

export function AssetReportsView() {
  const { data, isLoading, isError } = useAssetReportsQuery();
  const { setStatusFilter, statusOptions, filteredReports } =
    useAssetReportsFilters(data);

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching asset reports</div>;

  const isEmpty = (data ?? []).length === 0;

  return (
    <div className="p-5">
      <PageHeader
        title="Asset Health"
        description="Monitor reported asset issues, damage, and losses submitted by employees."
        icon={<MdReportProblem className="h-6 w-6" />}
      />

      {isEmpty ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Asset Reports Found"
            description="It seems there are no asset reports at the moment. You can wait for employees to submit reports."
            icon={<MdReport />}
          />
        </div>
      ) : (
        <>
          <div className="flex gap-4 justify-end mt-14 mb-6">
            <Select onValueChange={setStatusFilter}>
              <SelectTrigger className="w-50">
                <BadgeCheck className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={AssetReportColumns} data={filteredReports} />
        </>
      )}
    </div>
  );
}
