"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/DataTable";
import PageHeader from "@/components/pageHeader";
import { MdReportProblem } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import Loading from "@/components/ui/loading";
import { BadgeCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetReport } from "@/types/asset-report.type";
import { AssetReportColumns } from "../_components/AssetReportColumns";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

const unique = (values: string[]) => Array.from(new Set(values));

export default function AssetReportsPage() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAssetReports = async () => {
    try {
      const res = await axiosAuth.get("/api/asset-reports");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<AssetReport[]>({
    queryKey: ["asset-reports"],
    queryFn: fetchAssetReports,
    enabled: !!session?.backendTokens.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching asset reports</div>;

  const filteredData = data?.filter((report) => {
    return statusFilter === "all" || report.status === statusFilter;
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Asset Health"
        description="Monitor reported asset issues, damage, and losses submitted by employees."
        icon={<MdReportProblem className="h-6 w-6" />}
      />

      {data && data.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Asset Reports Found"
            description="It seems there are no asset reports at the moment. You can wait for employees to submit reports"
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585352/report_savzs4.svg"
          />
        </div>
      ) : (
        <>
          <div className="flex gap-4 justify-end mt-14 mb-6">
            <Select onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <BadgeCheck className="mr-2 h-5 w-5 text-muted-foreground text-monzo-success" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {unique(data?.map((a) => a.status) ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={AssetReportColumns} data={filteredData} />
        </>
      )}
    </div>
  );
}
