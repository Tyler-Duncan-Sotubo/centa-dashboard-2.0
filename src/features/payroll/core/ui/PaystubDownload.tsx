"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/ui/table";
import { CalendarDays, Download } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { EmployeeDetail } from "@/types/payRunDetails";
import GenericSheet from "@/shared/ui/generic-sheet";
import { FaMoneyBill } from "react-icons/fa";
import { DeductionType } from "@/types/deduction.type";
import DeductionModal from "@/app/dashboard/payroll/settings/adjustments/payroll-deductions/_components/DeductionModal";
import BonusModal from "@/app/dashboard/payroll/settings/adjustments/payroll-bonuses/_components/BonusModal";

interface PaystubDownloadProps<TData> {
  row: Row<TData>;
  filter?: string;
  deductionTypes: DeductionType[];
}

const PaystubDownload = <TData,>({
  row,
  filter,
  deductionTypes,
}: PaystubDownloadProps<TData>) => {
  const paystub = row.original as EmployeeDetail;
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);

  const trigger = (
    <Button variant="link" onClick={() => setSheetOpen(true)}>
      {filter ? "View Paystub" : "View"}
    </Button>
  );

  const voluntaryTotal =
    paystub.voluntaryDeductions?.reduce((sum, d) => {
      return sum + Number(d.amount || 0);
    }, 0) || 0;

  const totalDeductions =
    (Number(paystub.payeTax) || 0) +
    (Number(paystub.pensionContribution) || 0) +
    (Number(paystub.nhfContribution) || 0) +
    (Number(paystub.salaryAdvance) || 0) +
    (Number(voluntaryTotal) || 0);

  const totalReimbursementAmount = paystub.reimbursements.reduce(
    (sum, reimbursement) => sum + (Number(reimbursement.amount) || 0),
    0,
  );

  return (
    <div className="flex justify-center space-x-2">
      <GenericSheet
        trigger={trigger}
        title="Paystub Details"
        description={`View paystub details for ${paystub.name}`}
        position="right"
        open={isSheetOpen}
        onOpenChange={setSheetOpen}
        footer={<div className="flex items-center space-x-2"></div>}
      >
        <div>
          <div>
            {/* Payslip Info */}
            <div className="mt-6 border-b-2 border-gray-100 pb-6 flex space-x-10 items-center">
              {/* Payroll Month */}
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg shadow-xl text-black bg-orange-300">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Payroll Month</h3>
                  <p className="text-md font-medium">{paystub.payrollMonth}</p>
                </div>
              </div>

              {/* Net Salary */}
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg shadow-xl text-black bg-green-300">
                  <FaMoneyBill size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Net Salary</h3>
                  <p className="text-md font-medium">
                    {formatCurrency(paystub.netSalary)}
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="flex items-center justify-end mt-6 px-2">
              {paystub.payslip_pdf_url && (
                <Link
                  href={`${paystub.payslip_pdf_url}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="font-semibold">
                    <Download size={24} />
                    Download Paystub
                  </Button>
                </Link>
              )}
            </div>
            <Table className="text-md font-medium text-textSecondary mt-6 border-b-2 border-gray-100">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-textPrimary">Earnings</TableHead>
                  <TableHead className="text-right text-textPrimary">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Salary</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paystub.grossSalary)}
                  </TableCell>
                </TableRow>
                {Number(paystub.bonuses) !== 0 && (
                  <TableRow>
                    <TableCell>Bonus</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(paystub.bonuses)}
                    </TableCell>
                  </TableRow>
                )}
                {paystub.reimbursements?.length > 0 && (
                  <TableRow>
                    <TableCell>Reimbursements</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalReimbursementAmount)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell>Taxable Income</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paystub.taxableIncome)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div
              className={`flex items-center  mt-2 px-2 ${
                filter ? "justify-end" : "justify-between"
              }`}
            >
              {!filter && (
                <Button
                  onClick={() => {
                    setSheetOpen(false);
                    setIsBonusOpen(true);
                  }}
                  variant={"secondary"}
                >
                  Add Payment
                </Button>
              )}
              <div className="flex items-center justify-between text-sm space-x-2">
                <p>Total Payments</p>
                <p className="text-md font-semibold">
                  {formatCurrency(
                    Number(paystub.grossSalary) +
                      Number(paystub.bonuses || 0) +
                      totalReimbursementAmount,
                  )}
                </p>
              </div>
            </div>

            {/* Deductions Section */}
            <Table className="text-md font-medium text-textSecondary mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-textPrimary">Deduction</TableHead>
                  <TableHead className="text-right text-textPrimary">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>PAYE Tax</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paystub.payeTax)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pension Contribution</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paystub.pensionContribution)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>NHF Contribution</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paystub.nhfContribution)}
                  </TableCell>
                </TableRow>
                {paystub.voluntaryDeductions?.length > 0 &&
                  deductionTypes.map((type) => {
                    const match = paystub.voluntaryDeductions.find(
                      (d) => d.typeId === type.id,
                    );
                    if (!match) return null;
                    return (
                      <TableRow key={type.id}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(match.amount))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {Number(paystub.salaryAdvance) !== 0 && (
                  <TableRow>
                    <TableCell>Salary Advance</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(paystub.salaryAdvance)}
                    </TableCell>{" "}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div
              className={`flex items-center  mt-2 px-2 ${
                filter ? "justify-end" : "justify-between"
              }`}
            >
              {!filter && (
                <Button
                  onClick={() => {
                    setSheetOpen(false);
                    setIsOpen(true);
                  }}
                  variant={"secondary"}
                >
                  Add Deduction
                </Button>
              )}
              <div className="flex items-center justify-between text-sm space-x-2">
                <p>Total Deductions</p>
                <p className="text-md font-semibold">
                  {formatCurrency(totalDeductions)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GenericSheet>
      <DeductionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        employee={{
          id: paystub.employeeId,
          name: paystub.name,
        }}
      />
      {isBonusOpen && (
        <BonusModal
          isOpen={isBonusOpen}
          onClose={() => setIsBonusOpen(false)}
          employee={{
            id: paystub.employeeId,
            name: paystub.name,
          }}
        />
      )}
    </div>
  );
};

export default PaystubDownload;
