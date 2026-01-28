"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { officeLocation } from "@/types/location.type";
import { DeleteOfficeLocationDialog } from "./DeleteOfficeLocationDialog";
import { EditLocationSheet } from "./EditLocationSheet";

export const officeLocationsColumns: ColumnDef<officeLocation>[] = [
  { accessorKey: "name", header: "Location Name" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "street", header: "Street" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "state", header: "State" },
  { accessorKey: "longitude", header: "Longitude" },
  { accessorKey: "latitude", header: "Latitude" },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const loc = row.original;

      return (
        <div className="flex items-center justify-center gap-2">
          <EditLocationSheet
            isOpen={false}
            onClose={() => {}}
            defaultValues={{
              id: loc.id,
              name: loc.name,
              country: loc.country,
              street: loc.street,
              city: loc.city,
              state: loc.state,
              longitude: Number(loc.longitude),
              latitude: Number(loc.latitude),
            }}
          />

          <DeleteOfficeLocationDialog id={loc.id} name={loc.name} />
        </div>
      );
    },
  },
];
