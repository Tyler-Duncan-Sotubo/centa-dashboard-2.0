"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/DataTable";
import PageHeader from "@/components/pageHeader";
import { MdRequestQuote } from "react-icons/md";
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
import { AssetRequest } from "@/types/asset-request.type";
import { AssetRequestColumns } from "../_components/AssetRequestColumns";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

const unique = (values: string[]) => Array.from(new Set(values));

export default function AssetRequestsPage() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAssetRequests = async () => {
    try {
      const res = await axiosAuth.get("/api/asset-requests");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<AssetRequest[]>({
    queryKey: ["asset-requests"],
    queryFn: fetchAssetRequests,
    enabled: !!session?.backendTokens.accessToken,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching asset requests</div>;

  const filteredData = data?.filter((request) => {
    return statusFilter === "all" || request.status === statusFilter;
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Asset Requests"
        description="Review and process asset requests submitted by employees."
        icon={<MdRequestQuote className="h-6 w-6" />}
      />

      {data && data.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Asset Requests Found"
            description="It seems there are no asset requests at the moment. You can wait for employees to submit requests or create one manually."
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585350/requests_rbov2g.svg"
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

          <DataTable columns={AssetRequestColumns} data={filteredData} />
        </>
      )}
    </div>
  );
}
