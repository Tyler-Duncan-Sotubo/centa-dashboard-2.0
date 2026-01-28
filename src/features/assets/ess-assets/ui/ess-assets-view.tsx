"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Package, Plus } from "lucide-react";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import EmptyState from "@/shared/ui/empty-state";

import type { Asset } from "@/features/assets/core/types/asset.type";
import { useEssAssetsQuery } from "../hooks/use-ess-assets-query";
import { useEssAssetRequestsQuery } from "../hooks/use-ess-asset-requests-query";
import { AssetCard } from "./asset-card";
import { essAssetsColumns } from "./ess-assets-column";

export function EssAssetsView() {
  const router = useRouter();

  const {
    data: assets = [],
    isLoading: loadingAssets,
    isError: errorAssets,
  } = useEssAssetsQuery();

  const {
    data: assetRequests = [],
    isLoading: loadingRequests,
    isError: errorRequests,
  } = useEssAssetRequestsQuery();

  if (loadingAssets || loadingRequests) return <Loading />;

  // note: your queries swallow errors and return []
  // so isError will likely never be true
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            title="No Assets Found"
            description="It seems like you haven't added any assets yet. Click the button above to get started."
            icon={<Package size={56} className="text-muted-foreground" />}
          />
        </div>
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
            <h2 className="text-xl font-semibold">My Asset Requests</h2>
            <DataTable columns={essAssetsColumns} data={assetRequests} />
          </>
        ) : null}
      </div>
    </div>
  );
}
