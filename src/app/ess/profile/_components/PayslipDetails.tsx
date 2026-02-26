import React, { useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

interface Props {
  payslipSummary: Payslip[];
}

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { FaDownload } from "react-icons/fa";
import { DataTable } from "@/shared/ui/data-table";
import LastPayslipCard from "./LastPayslipCard";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { PayslipSummaryMobileRow } from "./PayslipSummaryMobileRow";

export type Payslip = {
  payslip_id: string;
  payroll_date: string;
  gross_salary: string;
  net_salary: string;
  totalDeduction: string;
  basic: string;
  housing: string;
  transport: string;
  payslip_pdf_url: string;
  paymentStatus: string;
};

export const payslipColumns: ColumnDef<Payslip>[] = [
  {
    accessorKey: "payroll_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Month
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const raw = row.getValue("payroll_date");
      return new Date(raw + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    },
  },
  {
    accessorKey: "net_salary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Net Salary
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("net_salary")),
  },
  {
    accessorKey: "gross_salary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Gross Salary
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("gross_salary")),
  },
  {
    accessorKey: "totalDeduction",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Deductions
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("totalDeduction")),
  },
  {
    accessorKey: "basic",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Basic
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("basic")),
  },
  {
    accessorKey: "housing",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Housing
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("housing")),
  },
  {
    accessorKey: "transport",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transport
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("transport")),
  },
  {
    id: "others",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Others
        <ChevronUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const gross = parseFloat(row.getValue("gross_salary"));
      const basic = parseFloat(row.getValue("basic"));
      const housing = parseFloat(row.getValue("housing"));
      const transport = parseFloat(row.getValue("transport"));
      const others = gross - basic - housing - transport;
      return formatCurrency(others);
    },
  },
  {
    id: "pdf",
    header: "Payslip",
    cell: ({ row }) => {
      const url = row.original.payslip_pdf_url;
      return (
        <>
          {row.original.payslip_pdf_url && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1">
                <FaDownload className="w-3 h-3" />
                PDF
              </Button>
            </a>
          )}
        </>
      );
    },
  },
];

export default function PayslipDetailsTable({ payslipSummary }: Props) {
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const years = useMemo(() => {
    const uniqueYears = new Set(
      payslipSummary.map((p) =>
        new Date(p.payroll_date + "-01").getFullYear().toString(),
      ),
    );
    return Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a));
  }, [payslipSummary]);

  const filteredData = useMemo(() => {
    return selectedYear === "all"
      ? payslipSummary
      : payslipSummary.filter(
          (p) =>
            new Date(p.payroll_date + "-01").getFullYear().toString() ===
            selectedYear,
        );
  }, [payslipSummary, selectedYear]);

  return (
    <div className="space-y-4">
      <LastPayslipCard lastPayslip={payslipSummary[0]} />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payslip Summary</h2>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={payslipColumns}
        data={filteredData}
        mobileRow={PayslipSummaryMobileRow}
        hideTableOnMobile
      />
    </div>
  );
}
