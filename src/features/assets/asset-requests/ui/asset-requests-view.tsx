"use client";

import React from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import EmptyState from "@/shared/ui/empty-state";

import { MdReport, MdRequestQuote } from "react-icons/md";
import { BadgeCheck } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAssetRequestsQuery } from "../hooks/use-asset-requests-query";
import { useAssetRequestsFilters } from "../hooks/use-asset-requests-filters";
import { AssetRequestColumns } from "./asset-request-columns";
import { FaClipboard } from "react-icons/fa6";

export function AssetRequestsView() {
  const { data, isLoading, isError } = useAssetRequestsQuery();
  const { setStatusFilter, statusOptions, filteredRequests } =
    useAssetRequestsFilters(data);

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching asset requests</div>;

  const isEmpty = (data ?? []).length === 0;

  return (
    <div className="p-5">
      <PageHeader
        title="Asset Requests"
        description="Review and process asset requests submitted by employees."
        icon={<MdRequestQuote className="h-6 w-6" />}
      />

      {isEmpty ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Asset Requests Found"
            description="It seems there are no asset requests at the moment. You can wait for employees to submit requests or create one manually."
            icon={<FaClipboard />}
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

          <DataTable columns={AssetRequestColumns} data={filteredRequests} />
        </>
      )}
    </div>
  );
}
