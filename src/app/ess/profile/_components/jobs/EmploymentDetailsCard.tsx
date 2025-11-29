// src/components/EmploymentDetailsCard.tsx
import React from "react";
import { format } from "date-fns";
import { KeyValueCard, KeyValueCardProps } from "./KeyValueCard";
import { Manager } from "./ManagerCard";

export interface EmploymentDetails {
  employeeNumber: string;
  employmentStatus: string;
  effectiveDate: string;
  probationEndDate: string;
  employeeManager: Manager;
  department: string;
  jobRole: string;
  costCenter: string;
  location: string;
  locationId: string;
  payGroup: string;
  payGroupId: string;
  departmentId: string;
  costCenterId: string;
  jobRoleId: string;
  companyRoleId: string;
  role: string;
  confirmed: boolean;
}

interface EmploymentDetailsCardProps {
  details: EmploymentDetails;
  employeeId: string; // Optional, if you need to pass employee ID for the manager
}

export function EmploymentDetailsCard({
  details,
  employeeId,
}: EmploymentDetailsCardProps) {
  const items: KeyValueCardProps["items"] = [
    {
      label: "Employee #",
      value: details.employeeNumber,
      name: "employeeNumber",
      displayValue: details.employeeNumber,
    },
    {
      label: "Status",
      value: details.employmentStatus
        ? details.employmentStatus.charAt(0).toUpperCase() +
          details.employmentStatus.slice(1)
        : "N/A",
      name: "employmentStatus",
      displayValue: details.employmentStatus,
    },
    {
      label: "Start Date",
      value: details.effectiveDate
        ? format(new Date(details.effectiveDate), "PPP")
        : "N/A",
      name: "employmentStartDate",
      displayValue: details.effectiveDate,
    },
    {
      label: "Probation Ends",
      value: format(new Date(details.probationEndDate), "PPP"),
      name: "probationEndDate",
      displayValue: format(new Date(details.probationEndDate), "PPP"),
    },
    {
      label: "Confirmed",
      value: details.confirmed ? "yes" : "no",
      name: "confirmed",
      displayValue: details.confirmed,
    },
    {
      label: "Department",
      value: details.department,
      name: "departmentId",
      displayValue: details.departmentId,
    },
    {
      label: "Job Title",
      value: details.jobRole,
      name: "jobRoleId",
      displayValue: details.jobRoleId,
    },
    {
      label: "Role",
      value: details.role,
      name: "companyRoleId",
      displayValue: details.companyRoleId,
    },
    {
      label: "Cost Center",
      value: details.costCenter,
      name: "costCenterId",
      displayValue: details.costCenterId,
    },
    {
      label: "Location",
      value: details.location,
      name: "locationId",
      displayValue: details.locationId,
    },
    {
      label: "Pay Group",
      value: details.payGroup,
      name: "payGroupId",
      displayValue: details.payGroupId,
    },
  ];

  return (
    <>
      <KeyValueCard
        title="Employment Details"
        items={items}
        fieldName="employee"
        employeeId={employeeId} // Assuming employeeManager has an id
      />
    </>
  );
}
