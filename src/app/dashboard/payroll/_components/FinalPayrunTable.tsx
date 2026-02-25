"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";

import PaystubDownload from "@/features/payroll/core/ui/PaystubDownload";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";
import { ReportDownloadModal } from "@/shared/ui/report-download-modal";
import { DeductionType } from "@/types/deduction.type";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";

export function FinalPayRunTable({
  data,
}: {
  data: EmployeeDetail[];
  name?: string;
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

  // ---------- show/hide column flags (mirror PayslipTable) ----------
  const showSalaryAdvance = React.useMemo(
    () => data.some((e) => Number((e as any).salaryAdvance ?? 0) > 0),
    [data],
  );

  const showBonuses = React.useMemo(
    () => data.some((e) => Number((e as any).bonuses ?? 0) > 0),
    [data],
  );

  const showReimbursements = React.useMemo(() => {
    return data.some((e) => {
      const rs = (e as any).reimbursements ?? [];
      return (
        rs.reduce((sum: number, r: any) => sum + (Number(r?.amount) || 0), 0) >
        0
      );
    });
  }, [data]);

  const visibleDeductionTypes = React.useMemo(() => {
    if (!deductionTypes?.length) return [];
    return deductionTypes.filter((type) =>
      data.some((emp) =>
        ((emp as any).voluntaryDeductions ?? []).some(
          (d: any) => d.typeId === type.id && Number(d.amount ?? 0) > 0,
        ),
      ),
    );
  }, [deductionTypes, data]);

  // ---------- columns (mirror PayslipTable) ----------
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
    accessorKey: "bonuses" as any,
    header: () => <div className="text-right">Bonus</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(Number((row.original as any).bonuses ?? 0))}
      </div>
    ),
  };

  const reimbursementsColumn: ColumnDef<EmployeeDetail> = {
    id: "reimbursements",
    header: () => <div className="text-right">Reimbursements</div>,
    cell: ({ row }) => {
      const reimbursements = ((row.original as any).reimbursements ??
        []) as any[];
      const total = reimbursements.reduce(
        (sum, r) => sum + (Number(r?.amount) || 0),
        0,
      );
      return (
        <div className="text-right font-medium">{formatCurrency(total)}</div>
      );
    },
  };

  const salaryAdvanceColumn: ColumnDef<EmployeeDetail> = {
    accessorKey: "salaryAdvance" as any,
    header: () => <div className="text-right">Salary Advance</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-error">
        {formatCurrency(Number((row.original as any).salaryAdvance ?? 0))}
      </div>
    ),
  };

  const netSalaryColumn: ColumnDef<EmployeeDetail> = {
    id: "netSalary",
    header: () => <div className="text-right">Net Salary</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-success">
        {formatCurrency((row.original as any).netSalary)}
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
        const deductions = ((row.original as any).voluntaryDeductions ??
          []) as any[];
        const deduction = deductions.find((d) => d.typeId === type.id);
        return (
          <div className="text-right font-medium text-error">
            {formatCurrency(Number(deduction?.amount ?? 0))}
          </div>
        );
      },
    }));

  const columns = React.useMemo<ColumnDef<EmployeeDetail>[]>(() => {
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
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end">
        <ReportDownloadModal
          id={(data?.[0] as any)?.payrollRunId}
          date={(data?.[0] as any)?.payrollDate}
        />
      </div>

      <DataTable<EmployeeDetail, unknown>
        columns={columns}
        data={data ?? []}
        filterKey="name"
        filterPlaceholder="Filter by employee name..."
      />
    </div>
  );
}
