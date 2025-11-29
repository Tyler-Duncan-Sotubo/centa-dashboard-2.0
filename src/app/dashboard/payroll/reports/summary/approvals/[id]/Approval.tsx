"use client";

import React from "react";
import { DollarSign, FileText, Home, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateMutation } from "@/hooks/useUpdateMutation";
import { formatCurrency } from "@/utils/formatCurrency";
import { PayRunDetails } from "@/types/payRunDetails";
import { FinalPayRunTable } from "../../../../_components/FinalPayrunTable";

const Approval = ({ payslip }: { payslip: PayRunDetails }) => {
  const Card = ({
    icon,
    title,
    value,
    iconColor = "bg-blue-500",
    money = false,
  }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    iconColor?: string;
    money?: boolean;
  }) => {
    return (
      <div className="bg-white flex items-center space-x-3">
        <div
          className={`p-5 rounded-lg shadow-xl text-white self-start ${iconColor}`}
        >
          {icon}
        </div>
        <div className=" items-center">
          <h3 className="text-sm font-semibold text-textSecondary">{title}</h3>
          <p className="text-xl font-bold">
            {money ? formatCurrency(value) : value}
          </p>
        </div>
      </div>
    );
  };

  const updatePayrollPaymentStatus = useUpdateMutation({
    endpoint: `/api/payroll/approve-payroll/${payslip.payrollRunId}`,
    successMessage: "Payment status updated successfully",
    refetchKey: "payRun",
  });

  const updatePaymentStatus = async (status: "paid" | "pending") => {
    await updatePayrollPaymentStatus({ status: status });
  };

  return (
    <section className="px-5">
      <section className="flex justify-end mb-10 space-x-6">
        <div className="flex space-x-6">
          {payslip.employees[0].paymentStatus === "in-progress" &&
            payslip.employees[0].approvalStatus === "completed" && (
              <Button
                className="font-bold"
                onClick={() => updatePaymentStatus("paid")}
              >
                Mark as Paid
              </Button>
            )}
          {payslip.employees[0].paymentStatus === "paid" && (
            <div className="bg-green-700 text-textInverse text-center py-2 px-6 rounded-md">
              <p className="font-bold">PAID</p>
            </div>
          )}
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 ">
        <Card
          icon={<DollarSign size={20} color="black" />}
          title="Total Cost of Payroll"
          value={payslip.totalCostOfPayroll}
          iconColor="bg-green-300"
          money
        />
        <Card
          icon={<PiggyBank size={20} color="black" />}
          title="Total Pension"
          value={payslip.totalPensionContribution}
          iconColor="bg-blue-300"
          money
        />
        <Card
          icon={<FileText size={20} color="black" />}
          title="Total PAYE"
          value={payslip.totalPAYE}
          iconColor="bg-yellow-300"
          money
        />
        <Card
          icon={<Home size={20} color="black" />}
          title="Total NHF"
          value={payslip.totalNHFContribution}
          iconColor="bg-red-300"
          money
        />
      </div>
      <FinalPayRunTable data={payslip.employees} name="" />;
    </section>
  );
};

export default Approval;
