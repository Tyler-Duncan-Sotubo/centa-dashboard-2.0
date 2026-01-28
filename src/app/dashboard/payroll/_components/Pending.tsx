"use client";

import { PayrollSchedule } from "@/features/payroll/core/ui/payroll-schedule";
import { EmployeeDetail } from "@/types/payRunDetails";
import React from "react";

const PayrollPending = ({
  payrollSummary,
}: {
  payrollSummary: EmployeeDetail[] | undefined;
}) => {
  const pendingPayroll = payrollSummary?.filter(
    (payroll) =>
      payroll.approvalStatus === "pending" ||
      payroll.paymentStatus === "pending",
  );

  return <PayrollSchedule data={pendingPayroll} />;
};

export default PayrollPending;
