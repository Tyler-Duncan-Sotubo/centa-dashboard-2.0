"use client";

import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";


import { FaDownload } from "react-icons/fa";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { Payslip } from "./PayslipDetails";

function PayrollStatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();

  // tweak these mappings to your real enum values
  const variant =
    s === "paid" || s === "successful"
      ? "approved"
      : s === "pending"
        ? "pending"
        : s === "failed" || s === "rejected"
          ? "rejected"
          : "secondary";

  return (
    <Badge variant={variant as any} className="capitalize">
      {status ?? "—"}
    </Badge>
  );
}

const formatPayrollMonth = (raw?: string | null) => {
  if (!raw) return "—";
  const d = new Date(`${raw}-01`);
  return isNaN(d.getTime()) ? "—" : format(d, "MMMM yyyy");
};

const safeNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const calcOthers = (p: Payslip) => {
  const gross = safeNumber(p.gross_salary);
  const basic = safeNumber(p.basic);
  const housing = safeNumber(p.housing);
  const transport = safeNumber(p.transport);
  return gross - basic - housing - transport;
};

export function PayslipSummaryMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Payslip>) {
  const p = row.original;

  const month = formatPayrollMonth(p.payroll_date);
  const net = formatCurrency(parseFloat(p.net_salary));
  const gross = formatCurrency(parseFloat(p.gross_salary));
  const deductions = formatCurrency(parseFloat(p.totalDeduction));
  const basic = formatCurrency(parseFloat(p.basic));
  const housing = formatCurrency(parseFloat(p.housing));
  const transport = formatCurrency(parseFloat(p.transport));
  const others = formatCurrency(calcOthers(p));

  const onDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.payslip_pdf_url) return;
    window.open(p.payslip_pdf_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(p)}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{month}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Net: <span className="font-medium text-foreground">{net}</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <PayrollStatusBadge status={p.paymentStatus} />

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onDownload}
            disabled={!p.payslip_pdf_url}
          >
            <FaDownload className="w-3 h-3" />
            PDF
          </Button>
        </div>
      </div>

      {/* details */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Gross</span>
          <span className="text-sm font-medium">{gross}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Deductions</span>
          <span className="text-sm font-medium">{deductions}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Basic</span>
          <span className="text-sm font-medium">{basic}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Housing</span>
          <span className="text-sm font-medium">{housing}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Transport</span>
          <span className="text-sm font-medium">{transport}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Others</span>
          <span className="text-sm font-medium">{others}</span>
        </div>
      </div>
    </div>
  );
}
