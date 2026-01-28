"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import PaystubDownload from "./PaystubDownload";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { DeductionType } from "@/types/deduction.type";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import { DataTable } from "@/shared/ui/data-table";

export function PayslipTable({
  data,
  name,
}: {
  data: EmployeeDetail[];
  name: string;
}) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchDeductionTypes = async () => {
    const res = await axiosInstance.get("/api/deductions/types");
    return res.data.data as DeductionType[];
  };

  const { data: deductionTypes, isLoading: isLoadingTypes } = useQuery<
    DeductionType[]
  >({
    queryKey: ["deductionTypes"],
    queryFn: fetchDeductionTypes,
    enabled: Boolean(session?.backendTokens?.accessToken),
  });

  const baseColumns: ColumnDef<EmployeeDetail>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee
          <ChevronUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "grossSalary",
      header: () => <div className="text-right">Gross Salary</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("grossSalary"))}
        </div>
      ),
    },
    {
      accessorKey: "payeTax",
      header: () => <div className="text-right">PAYE</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("payeTax"))}
        </div>
      ),
    },
    {
      accessorKey: "pensionContribution",
      header: () => <div className="text-right">Pension</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("pensionContribution"))}
        </div>
      ),
    },
    {
      accessorKey: "nhfContribution",
      header: () => <div className="text-right">NHF</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-error">
          {formatCurrency(row.getValue("nhfContribution"))}
        </div>
      ),
    },
    {
      accessorKey: "bonuses",
      header: () => <div className="text-right">Bonus</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("bonuses"))}
        </div>
      ),
    },
    {
      id: "reimbursements",
      header: () => <div className="text-right">Reimbursements</div>,
      cell: ({ row }) => {
        const reimbursements = row.original.reimbursements || [];

        const totalReimbursementAmount = reimbursements.reduce(
          (sum, reimbursement) => sum + (Number(reimbursement.amount) || 0),
          0,
        );

        return (
          <div className="text-right font-medium">
            {formatCurrency(totalReimbursementAmount)}
          </div>
        );
      },
    },
  ];

  const netSalaryColumn: ColumnDef<EmployeeDetail> = {
    id: "netSalary",
    header: () => <div className="text-right">Net Salary</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-success">
        {formatCurrency(row.original.netSalary)}
      </div>
    ),
  };

  const payStubColumn: ColumnDef<EmployeeDetail> = {
    id: "Pay_Stub",
    enableHiding: false,
    header: () => <div className="text-center">Pay Stub</div>,
    cell: ({ row }) => (
      <PaystubDownload row={row} deductionTypes={deductionTypes ?? []} />
    ),
  };

  const voluntaryDeductionColumns: ColumnDef<EmployeeDetail>[] =
    deductionTypes?.map((type) => ({
      id: `voluntary-${type.id}`,
      header: () => <div className="text-right">{type.name}</div>,
      cell: ({ row }) => {
        const deductions = row.original.voluntaryDeductions || [];
        const deduction = deductions.find((d) => d.typeId === type.id);
        return (
          <div className="text-right font-medium">
            {formatCurrency(Number(deduction?.amount ?? 0))}
          </div>
        );
      },
    })) ?? [];

  const allColumns = React.useMemo(
    () => [
      ...baseColumns,
      ...voluntaryDeductionColumns,
      netSalaryColumn,
      payStubColumn,
    ],
    // important: depend on deductionTypes so voluntary columns update
    [deductionTypes],
  );

  if (isLoadingTypes) {
    return <div>Loading deduction types...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-6">
        <p className="text-xl font-medium">{name}</p>
      </div>

      <DataTable<EmployeeDetail, unknown>
        columns={allColumns}
        data={data}
        filterKey="name"
        filterPlaceholder="Filter by employee name..."
      />
    </div>
  );
}
