"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/DataTable";
import Loading from "@/components/ui/loading";
import { columns } from "./_components/assetsColumn";
import { AssetCard } from "./_components/AssetCard";
import { Asset } from "@/types/asset.type";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

export default function AssetsPage() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  const router = useRouter();

  /* ------------------- Fetch assigned assets ------------------- */
  const {
    data: assets = [],
    isLoading: loadingAssets,
    isError: errorAssets, // this will always be false if we swallow errors
  } = useQuery({
    queryKey: ["assets", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/assets/employee/${session?.user.id}`
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) {
          console.error("Asset fetch failed:", err.response?.data);
        } else {
          console.error("Unexpected error:", err);
        }
        return []; // fallback to empty array
      }
    },
  });

  /* ------------------- Fetch asset requests ------------------- */
  const {
    data: assetRequests = [],
    isLoading: loadingRequests,
    isError: errorRequests,
  } = useQuery({
    queryKey: ["asset-requests", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          `/api/asset-requests/employee/${session?.user.id}`
        );
        return res.data.data;
      } catch (err) {
        if (isAxiosError(err)) {
          console.error("Asset request fetch failed:", err.response?.data);
        } else {
          console.error("Unexpected error:", err);
        }
        return []; // fallback to empty array
      }
    },
  });

  if (loadingAssets || loadingRequests) return <Loading />;
  if (errorAssets || errorRequests)
    return (
      <div className="text-red-500 text-center py-12">
        Error loading data. Please try again later.
      </div>
    );

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Assets"
        description="View assets assigned and your request history."
      >
        <Button onClick={() => router.push("/ess/assets/request")}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </PageHeader>

      {/* Assigned Assets */}
      {assets.length === 0 ? (
        <EmptyState
          title="No Assets Found"
          description="You have no active asset assigned at the moment."
          image={
            "https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585351/assets_c2e58v.svg"
          } // or "/images/empty-jobs.png" from public folder
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset: Asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Asset Request Table */}
      <div className="max-w-4xl">
        {assetRequests.length > 0 ? (
          <>
            {/* Divider */}
            <h2 className="text-xl font-semibold">My Asset Requests</h2>
            <DataTable columns={columns} data={assetRequests} />
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
