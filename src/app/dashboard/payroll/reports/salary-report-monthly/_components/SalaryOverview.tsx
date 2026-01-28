"use client";

import { useDownloadFile } from "@/shared/utils/useDownloadFile";
import { useSession } from "next-auth/react";
import { BiExport } from "react-icons/bi";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { EmployeeSalaryBreakdown } from "./EmployeeSalaryBreakdown";
import { SalaryDistribution } from "./EmployeeSalaryStats";

interface spendByDepartmentType {
  totalNetSalary: string;
  departmentName: string;
}
interface salaryStats {
  avgSalary: number;
  highestPaid: number;
  lowestPaid: number;
}

interface salaryDistribution {
  salaryRange: string;
  count: number;
}

interface SalaryData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  breakdown: any;
  stats: salaryStats;
  distribution: salaryDistribution[];
  byDepartment: spendByDepartmentType[];
}

const SalaryOverview = ({ data }: { data: SalaryData }) => {
  const { breakdown, stats, distribution, byDepartment } = data;
  const { data: session } = useSession();
  const token = session?.backendTokens?.accessToken;
  const { download, isLoading } = useDownloadFile(token);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableMonths: string[] = Array.from(
    new Set(
      (data.breakdown as { payrollMonth: string }[])?.map(
        (item) => item.payrollMonth,
      ),
    ),
  )
    .sort()
    .reverse();

  return (
    <>
      <EmployeeSalaryBreakdown data={breakdown} />
      <div className="flex items-center space-x-4 justify-end mt-10">
        <Select
          value={selectedMonth ?? undefined}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Payroll Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month: string) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="secondary"
          onClick={() =>
            selectedMonth &&
            download(
              `/api/payroll-report/gen-cost-by-department?month=${selectedMonth}`,
            )
          }
          isLoading={isLoading}
          disabled={isLoading || !selectedMonth}
        >
          <BiExport className="mr-2" />
          Export Cost By Department
        </Button>
      </div>
      <SalaryDistribution
        salaryStats={stats}
        salaryDistribution={distribution}
        spendByDepartment={byDepartment}
      />
    </>
  );
};

export default SalaryOverview;
