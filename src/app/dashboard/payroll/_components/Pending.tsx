"use client";

import { PayrollSchedule } from "@/components/common/tables/payroll-schedule";
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
      payroll.paymentStatus === "pending"
  );

  return <PayrollSchedule data={pendingPayroll} />;
};

export default PayrollPending;
