"use client";

import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { MapPin, Layers, BadgeCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetColumns } from "./_components/AssetColumns";
import { Asset } from "@/types/asset.type";
import PageHeader from "@/components/pageHeader";
import { Button } from "@/components/ui/button";
import BulkUploadModal from "@/components/common/BulkUploadModal";
import { LuImport } from "react-icons/lu";
import { MdComputer } from "react-icons/md";
import { AssetModal } from "./_components/AssetModal";
import Loading from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

const unique = (values: string[]) => Array.from(new Set(values));

export default function AssetsPage() {
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const fetchAssets = async () => {
    try {
      const res = await axiosAuth.get("/api/assets");
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading, isError } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: fetchAssets,
    enabled: !!session?.backendTokens.accessToken,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching employees</div>;

  const filteredData = data?.filter((asset) => {
    const statusMatch = statusFilter === "all" || asset.status === statusFilter;
    const categoryMatch =
      categoryFilter === "all" || asset.category === categoryFilter;
    const locationMatch =
      locationFilter === "all" || asset.location === locationFilter;
    return statusMatch && categoryMatch && locationMatch;
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Assets"
        description="Manage your organization's assets, including laptops, monitors, phones, and more. AI-powered depreciation modeling — smarter, market-aware asset valuation at scale."
        icon={<MdComputer className="h-6 w-6" />}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            variant={"outline"}
          >
            <LuImport />
            Import
          </Button>

          <AssetModal />
        </div>
      </PageHeader>

      {data && data.length === 0 ? (
        <div className="mt-20">
          <EmptyState
            title="No Assets Found"
            description="It seems like you haven't added any assets yet. Click the button above to get started."
            image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585351/assets_c2e58v.svg"
          />
        </div>
      ) : (
        <>
          <section className="flex gap-4 justify-end mt-14 mb-6">
            <div className="flex gap-4 justify-end">
              {/* Status Filter */}
              <Select onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <BadgeCheck className="mr-2 h-6 w-6 text-muted-foreground text-monzo-success" />
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

              {/* Category Filter */}
              <Select onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <Layers className="mr-2 h-5 w-5 text-muted-foreground text-monzo-monzoOrange" />
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {unique(data?.map((a) => a.category) ?? []).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[200px]">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground text-red-600" />
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {unique(data?.map((a) => a.location) ?? []).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
          <DataTable columns={AssetColumns} data={filteredData} />
        </>
      )}

      <BulkUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
