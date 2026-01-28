"use client";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { officeLocationsColumns } from "./office-locations-columns";
import { useOfficeLocations } from "../hooks/use-office-locations";
import { CreateLocationSheet } from "./CreateLocationSheet";

export function OfficeLocationsContainer() {
  const {
    status,
    officeLocations,
    isLoadingOfficeLocations,
    isErrorOfficeLocations,
  } = useOfficeLocations();

  if (status === "loading" || isLoadingOfficeLocations) return <Loading />;
  if (isErrorOfficeLocations)
    return <div className="text-red-500">Failed to load leave settings</div>;

  return (
    <section>
      <PageHeader
        title="Office Locations"
        description="Manage office locations and their geo-coordinates."
        tooltip="Office locations are used to define the physical locations of your offices, including their addresses and geo-coordinates. This information is important for attendance tracking and reporting purposes."
      >
        <CreateLocationSheet />
      </PageHeader>

      <div className="my-2 space-y-4 py-6 mt-10">
        <DataTable columns={officeLocationsColumns} data={officeLocations} />
      </div>
    </section>
  );
}
