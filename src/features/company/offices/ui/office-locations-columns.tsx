"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { officeLocation } from "@/types/location.type";
import { DeleteOfficeLocationDialog } from "./DeleteOfficeLocationDialog";
import { EditLocationSheet } from "./EditLocationSheet";
import { Badge } from "@/shared/ui/badge";

const formatCoordinate = (value: string | number | null | undefined) => {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toFixed(6); // 6 decimal places
};

export const officeLocationsColumns: ColumnDef<officeLocation>[] = [
  { accessorKey: "name", header: "Location Name" },

  {
    accessorKey: "locationType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.locationType;

      return (
        <Badge
          variant={
            type === "OFFICE"
              ? "approved"
              : type === "REMOTE"
                ? "ongoing"
                : "outline"
          }
        >
          {type}
        </Badge>
      );
    },
  },

  { accessorKey: "country", header: "Country" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "state", header: "State" },

  {
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => formatCoordinate(row.original.latitude),
  },

  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => formatCoordinate(row.original.longitude),
  },

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
              city: loc.city,
              state: loc.state,
              longitude: Number(loc.longitude),
              latitude: Number(loc.latitude),
              locationType: loc.locationType as "OFFICE" | "HOME" | "REMOTE",
              street: loc.street,
            }}
          />

          <DeleteOfficeLocationDialog id={loc.id} name={loc.name} />
        </div>
      );
    },
  },
];
