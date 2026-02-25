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

  // ---------- show/hide column flags ----------
  const showSalaryAdvance = React.useMemo(
    () => data.some((e) => Number(e.salaryAdvance ?? 0) > 0),
    [data],
  );

  const showBonuses = React.useMemo(
    () => data.some((e) => Number(e.bonuses ?? 0) > 0),
    [data],
  );

  const showReimbursements = React.useMemo(() => {
    return data.some((e) => {
      const rs = e.reimbursements ?? [];
      return (
        rs.reduce((sum, r) => sum + (Number((r as any).amount) || 0), 0) > 0
      );
    });
  }, [data]);

  const visibleDeductionTypes = React.useMemo(() => {
    if (!deductionTypes?.length) return [];
    return deductionTypes.filter((type) =>
      data.some((emp) =>
        (emp.voluntaryDeductions ?? []).some(
          (d) => d.typeId === type.id && Number(d.amount ?? 0) > 0,
        ),
      ),
    );
  }, [deductionTypes, data]);

  // ---------- columns ----------
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
  ];

  const bonusesColumn: ColumnDef<EmployeeDetail> = {
    accessorKey: "bonuses",
    header: () => <div className="text-right">Bonus</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(Number(row.original.bonuses ?? 0))}
      </div>
    ),
  };

  const reimbursementsColumn: ColumnDef<EmployeeDetail> = {
    id: "reimbursements",
    header: () => <div className="text-right">Reimbursements</div>,
    cell: ({ row }) => {
      const reimbursements = row.original.reimbursements || [];
      const total = reimbursements.reduce(
        (sum, r: any) => sum + (Number(r.amount) || 0),
        0,
      );
      return (
        <div className="text-right font-medium">{formatCurrency(total)}</div>
      );
    },
  };

  const salaryAdvanceColumn: ColumnDef<EmployeeDetail> = {
    accessorKey: "salaryAdvance",
    header: () => <div className="text-right">Salary Advance</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-error">
        {formatCurrency(Number(row.original.salaryAdvance ?? 0))}
      </div>
    ),
  };

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
    visibleDeductionTypes.map((type) => ({
      id: `voluntary-${type.id}`,
      header: () => <div className="text-right">{type.name}</div>,
      cell: ({ row }) => {
        const deductions = row.original.voluntaryDeductions || [];
        const deduction = deductions.find((d) => d.typeId === type.id);
        return (
          <div className="text-right font-medium text-error">
            {formatCurrency(Number(deduction?.amount ?? 0))}
          </div>
        );
      },
    }));

  const allColumns = React.useMemo(() => {
    const cols: ColumnDef<EmployeeDetail>[] = [...baseColumns];

    if (showBonuses) cols.push(bonusesColumn);
    if (showReimbursements) cols.push(reimbursementsColumn);
    if (showSalaryAdvance) cols.push(salaryAdvanceColumn);

    cols.push(...voluntaryDeductionColumns);
    cols.push(netSalaryColumn, payStubColumn);

    return cols;
  }, [
    showBonuses,
    showReimbursements,
    showSalaryAdvance,
    voluntaryDeductionColumns,
    deductionTypes,
  ]);

  if (isLoadingTypes) return <div>Loading deduction types...</div>;

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
