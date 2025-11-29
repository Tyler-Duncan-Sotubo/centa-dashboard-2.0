/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bonus } from "@/types/bonus.type";
import { Deduction } from "@/types/deduction.type";
import { Employee, EmployeeGroup } from "@/types/employees.type";
import { EmployeePayroll } from "@/types/employees.type";

function calculatePAYE(
  annualSalary: number,
  pension: number,
  nhf: number
): { paye: number; taxableIncome: number } {
  let paye = 0;

  const redefinedAnnualSalary = annualSalary - pension - nhf;

  // Compute Personal Allowance correctly in kobo
  const personalAllowance = 200000 * 100 + 0.2 * redefinedAnnualSalary;

  // Compute Taxable Income (Ensuring it's non-negative)
  const taxableIncome = Math.max(
    annualSalary - personalAllowance - pension - nhf,
    0
  );

  // PAYE Tax Brackets (Nigerian System in Kobo)
  const brackets = [
    { limit: 300000 * 100, rate: 0.07 }, // First ₦300,000
    { limit: 600000 * 100, rate: 0.11 }, // Next ₦300,000
    { limit: 1100000 * 100, rate: 0.15 }, // Next ₦500,000
    { limit: 1600000 * 100, rate: 0.19 }, // Next ₦500,000
    { limit: 3200000 * 100, rate: 0.21 }, // Next ₦1,600,000
    { limit: Infinity, rate: 0.24 }, // Above ₦3,200,000
  ];

  let remainingIncome = taxableIncome;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    // Tax only the portion within the bracket range
    const taxableAmount = Math.min(
      remainingIncome,
      bracket.limit - previousLimit
    );
    paye += taxableAmount * bracket.rate;
    remainingIncome -= taxableAmount;
    previousLimit = bracket.limit;
  }

  return {
    paye: Math.round(paye), // Convert to Naira
    taxableIncome: Math.round(taxableIncome), // Convert to Naira
  };
}

export function CalculatePayroll(
  employees: Employee[] | undefined,
  groups: EmployeeGroup[] | undefined,
  customDeduction: Deduction[] | undefined,
  bonuses: Bonus[] | undefined,
  settings: any
): EmployeePayroll[] {
  if (!employees) return [];
  return employees.map((employee) => {
    const annualGross = employee?.annualGross ?? 0;
    const monthlySalary = annualGross / 12;

    // Find the employee's group settings
    const employeeGroup = groups?.find(
      (group) => group.id === employee.groupId
    );

    // Determine whether to apply deductions based on the group or fallback settings
    const applyPension = employeeGroup
      ? employeeGroup.apply_pension
      : settings?.applyPension;

    const applyNHF =
      employee.applyNHf ??
      employeeGroup?.apply_nhf ??
      settings?.applyNHF ??
      false;

    const applyPAYE = employeeGroup
      ? employeeGroup.apply_paye
      : settings?.applyPaye;

    // Breakdown calculations
    const basic = ((settings?.basicPercent ?? 0) / 100) * annualGross;
    const housing = ((settings?.housingPercent ?? 0) / 100) * annualGross;
    const transport = ((settings?.transportPercent ?? 0) / 100) * annualGross;
    const BHT = basic + housing + transport; // Basic + Housing + Transport

    // Calculate deductions (annual)
    const pension = applyPension ? 0.08 * BHT : 0;
    const NHF = applyNHF ? 0.025 * basic : 0;

    // Calculate PAYE and Chargeable Income
    const { paye, taxableIncome } = applyPAYE
      ? calculatePAYE(annualGross, pension, NHF)
      : { paye: 0, taxableIncome: 0 };

    const monthlyPAYE = paye / 12;
    const monthlyChargeableIncome = Math.round(taxableIncome / 12);

    // Custom Deductions (only if applyAdditionalDeductions is true)
    const additionalDeductions = Array.isArray(customDeduction)
      ? customDeduction
          ?.filter((deduction) => deduction.employee_id === employee.id)
          .reduce((acc, curr) => acc + curr.amount, 0)
      : 0;

    // Bonuses
    const bonus = Array.isArray(bonuses)
      ? bonuses
          ?.filter((bonus) => bonus.employee_id === employee.id)
          .reduce((acc, curr) => acc + curr.amount, 0)
      : 0;

    // Compute Total Monthly Deductions
    const totalDeductions =
      monthlyPAYE + pension / 12 + NHF / 12 + (additionalDeductions ?? 0);

    // Compute Take-Home Pay
    const netSalary = monthlySalary - totalDeductions;

    // Effective Tax Rate
    const effectiveTaxRate = ((monthlyPAYE / monthlySalary) * 100).toFixed(2);

    // Average Tax Rate
    const averageTaxRate = (
      (monthlyPAYE / monthlyChargeableIncome) *
      100
    ).toFixed(2);

    return {
      employee_number: employee.employeeNumber,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      grossSalary: monthlySalary,
      taxableIncome: monthlyChargeableIncome,
      PAYE: monthlyPAYE,
      pension: pension / 12,
      NHF: NHF / 12,
      additionalDeductions,
      netSalary,
      totalDeductions,
      bonus,
      effectiveTaxRate: `${effectiveTaxRate} %`,
      averageTaxRate: `${averageTaxRate} %`,
      basic: Math.round(basic / 12),
      housing: Math.round(housing / 12),
      transport: Math.round(transport / 12),
    };
  });
}
