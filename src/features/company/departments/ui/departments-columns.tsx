"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Avatars } from "@/shared/ui/avatars";
import DataTableRowActions from "@/shared/ui/data-table-row-actions";
import { Department } from "../types/department.type";

export const departmentsColumns: ColumnDef<Department>[] = [
  {
    id: "custom_department_id",
    header: "Department ID",
    cell: ({ row }) => {
      const index = row.index + 1;
      const formattedId = `D${index.toString().padStart(4, "0")}`;
      return <div className="capitalize">{formattedId}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    id: "head",
    header: "Head Of Department",
    cell: ({ row }) => {
      const head = row.original.head;
      return head ? (
        <div className="flex items-center gap-2">
          {head.avatarUrl && <Avatars name={head.name} src={head.avatarUrl} />}
          <span className="capitalize font-medium">{head.name}</span>
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    id: "members",
    header: "Members",
    cell: ({ row }) => {
      const employees = row.original.employees || [];
      if (!employees.length) return <span className="text-gray-400">—</span>;

      return (
        <div className="flex -space-x-5">
          {employees.slice(0, 5).map((emp, idx) => (
            <Link
              key={emp.id}
              href={`/dashboard/employees/${emp.id}`}
              className="avatar-stack-link inline-block border-2 border-white rounded-full bg-gray-100 transition-transform hover:-translate-y-1 focus:outline-hidden"
              style={{ zIndex: 10 - idx }}
              title={emp.name}
            >
              <Avatars name={emp.name} src={emp.avatarUrl} />
            </Link>
          ))}

          {employees.length > 5 && (
            <span className="ml-2 text-xs text-gray-600">
              +{employees.length - 5}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ChevronUpDown />
      </Button>
    ),
    accessorFn: (row: Department) => row.createdAt,
    cell: ({ getValue }) => {
      const raw = getValue<string>();
      const date = raw ? new Date(raw) : null;
      if (!date || isNaN(date.getTime())) return <div>—</div>;

      return (
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        basePath="departments"
        getId={(data) => data.id}
        getName={(data) => data.name}
      />
    ),
  },
];
