import React from "react";
import { Button } from "@/shared/ui/button";
import { FaDownload } from "react-icons/fa";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";

interface PayslipEntry {
  payroll_date: string;
  gross_salary: string;
  net_salary: string;
  totalDeduction: string;
  basic: string;
  housing: string;
  transport: string;
  payslip_pdf_url: string;
  paymentStatus: string;
}

interface Props {
  lastPayslip: PayslipEntry;
}

export default function LastPayslipCard({ lastPayslip }: Props) {
  if (!lastPayslip) {
    return (
      <div className="p-4 h-full rounded-lg border max-w-xl mt-10 text-center">
        <h2 className="text-lg font-semibold mb-2">Latest Payslip</h2>
        <p className="text-gray-500">No payslip data available.</p>
      </div>
    );
  }
  const {
    payroll_date,
    gross_salary,
    net_salary,
    totalDeduction,
    basic,
    housing,
    transport,
    payslip_pdf_url,
    paymentStatus,
  } = lastPayslip;

  const formattedMonth = new Date(payroll_date + "-01").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
    },
  );

  const others =
    parseFloat(gross_salary) -
    parseFloat(basic) -
    parseFloat(housing) -
    parseFloat(transport);

  return (
    <div className="p-4 h-full rounded-lg border max-w-xl mt-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Latest Payslip - {formattedMonth}
          </h2>
          <Badge
            variant={paymentStatus === "paid" ? "approved" : "pending"}
            className="mt-1"
          >
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </Badge>
        </div>
        <Link
          href={payslip_pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          <Button variant="outline" className="gap-2">
            <FaDownload className="w-4 h-4" />
            PDF
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-md">
        <div className="font-medium">Net Salary:</div>
        <div>{formatCurrency(parseFloat(net_salary))}</div>

        <div className="font-medium">Gross Salary:</div>
        <div>{formatCurrency(parseFloat(gross_salary))}</div>

        <div className="font-medium">Total Deduction:</div>
        <div>{formatCurrency(parseFloat(totalDeduction))}</div>

        <div className="font-medium">Basic:</div>
        <div>{formatCurrency(parseFloat(basic))}</div>

        <div className="font-medium">Housing:</div>
        <div>{formatCurrency(parseFloat(housing))}</div>

        <div className="font-medium">Transport:</div>
        <div>{formatCurrency(parseFloat(transport))}</div>

        <div className="font-medium">Others:</div>
        <div>{formatCurrency(others)}</div>
      </div>
    </div>
  );
}
