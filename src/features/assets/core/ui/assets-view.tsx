"use client";

import { useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import PageHeader from "@/shared/ui/page-header";
import EmptyState from "@/shared/ui/empty-state";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { MapPin, Layers, BadgeCheck, Package } from "lucide-react";
import { LuImport } from "react-icons/lu";
import { MdComputer } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAssetsQuery } from "../hooks/use-assets-query";
import { useAssetsFilters } from "../hooks/use-assets-filters";
import { AssetModal } from "./asset-modal";
import { AssetColumns } from "./asset-columns";

export function AssetsView() {
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const { data, isLoading, isError } = useAssetsQuery();
  const {
    setStatusFilter,
    setCategoryFilter,
    setLocationFilter,
    statusOptions,
    categoryOptions,
    locationOptions,
    filteredAssets,
  } = useAssetsFilters(data);

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching assets</div>;

  const isEmpty = (data ?? []).length === 0;

  return (
    <div className="p-5">
      <PageHeader
        title="Assets"
        description="Manage your organization's assets, including laptops, monitors, phones, and more. AI-powered depreciation modeling — smarter, market-aware asset valuation at scale."
        icon={<MdComputer className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsBulkOpen(true)} variant={"outline"}>
            <LuImport />
            Import
          </Button>

          <AssetModal />
        </div>
      </PageHeader>

      {isEmpty ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <EmptyState
            title="No Assets Found"
            description="It seems like you haven't added any assets yet. Click the button above to get started."
            icon={<Package size={56} className="text-muted-foreground" />}
          />
        </div>
      ) : (
        <>
          <section className="flex gap-4 justify-end mt-14 mb-6">
            <div className="flex gap-4 justify-end">
              {/* Status Filter */}
              <Select onValueChange={setStatusFilter}>
                <SelectTrigger className="w-50">
                  <BadgeCheck className="mr-2 h-6 w-6 text-monzo-success" />
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

              {/* Category Filter */}
              <Select onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-50">
                  <Layers className="mr-2 h-5 w-5 text-monzo-monzoOrange" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select onValueChange={setLocationFilter}>
                <SelectTrigger className="w-50">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locationOptions.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <DataTable columns={AssetColumns} data={filteredAssets} />
        </>
      )}

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Upload Expenses"
        endpoint="/api/assets/bulk"
        refetchKey="assets"
        successMessage="Assets uploaded successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585685/assets_furiv2.csv"
        exampleDownloadLabel=""
      />
    </div>
  );
}
