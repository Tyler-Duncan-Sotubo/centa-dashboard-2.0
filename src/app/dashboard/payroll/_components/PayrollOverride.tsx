"use client";

import { z } from "zod";
import GenericSheet from "@/components/ui/generic-sheet";
import { Button } from "@/components/ui/button";
import { MdPayments } from "react-icons/md";
import { useState } from "react";
import EmployeeOverride from "./overrides/EmployeeOverride";
import AddPayElementForm from "./overrides/AddPayElementForm";

export const overRideSchema = z.object({
  notes: z.string().min(1, "Note is required"),
  employeeId: z.string().min(1, "Employee is required"),
});

export const PayrollOverride = ({ payrollDate }: { payrollDate: string }) => {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const trigger = (
    <Button onClick={() => setSheetOpen(true)} variant="secondary">
      <MdPayments size={20} />
      Add to Payroll
    </Button>
  );

  return (
    <GenericSheet
      trigger={trigger}
      title="Add Employee Pay Element"
      description="Add a dynamic pay element to the payroll."
      position="right"
      open={isSheetOpen}
      onOpenChange={setSheetOpen}
      footer={<div></div>}
    >
      {/* Add Pay Element Form */}
      <AddPayElementForm
        payrollDate={payrollDate}
        setSheetOpen={setSheetOpen}
      />
    </GenericSheet>
  );
};

export default EmployeeOverride;
