"use client";

import { DataTable } from "@/shared/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Button } from "@/shared/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

type DeductionByEmployee = {
  employeeName: string;
  paye: number;
  pension: number;
  nhf: number;
  salaryAdvance: number;
  voluntary: number;
  total: number;
};

export const DeductionByEmployeeTable = ({
  data,
}: {
  data: DeductionByEmployee[];
}) => {
  const columns: ColumnDef<DeductionByEmployee>[] = [
    {
      id: "custom_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
        </Button>
      ),
      cell: ({ row }) => {
        const index = row.index + 1; // Ensure it starts from 1
        const formattedId = `${index.toString().padStart(2)}`; // D0001, D0002...
        return <div className="capitalize">{formattedId}</div>;
      },
    },

    {
      accessorKey: "employee",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ChevronsUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.original.employeeName as string;
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("");
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-14 h-14">
              <AvatarFallback>
                <div className="bg-monzo-background w-20 h-20 text-white flex items-center justify-center font-bold">
                  {initials}
                </div>
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="capitalize font-semibold">
                {row.original.employeeName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "paye",
      header: "PAYE",
      cell: ({ row }) => formatCurrency(Number(row.original.paye)),
    },
    {
      accessorKey: "pension",
      header: "Pension",
      cell: ({ row }) => formatCurrency(Number(row.original.pension)),
    },
    {
      accessorKey: "nhf",
      header: "NHF",
      cell: ({ row }) => formatCurrency(Number(row.original.nhf)),
    },
    {
      accessorKey: "salaryAdvance",
      header: "Salary Advance",
      cell: ({ row }) => formatCurrency(Number(row.original.salaryAdvance)),
    },
    {
      accessorKey: "voluntary",
      header: "Voluntary",
      cell: ({ row }) => formatCurrency(Number(row.original.voluntary)),
    },
    {
      accessorKey: "total",
      header: "Total Deduction",
      cell: ({ row }) => formatCurrency(Number(row.original.total)),
    },
  ];

  return (
    <div className="mt-8">
      <DataTable columns={columns} data={data} />
    </div>
  );
};
