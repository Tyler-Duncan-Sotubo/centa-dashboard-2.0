"use client";

import { Button } from "@/shared/ui/button";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

interface PayrollTableActionProps<TData extends object> {
  row: Row<TData>;
  basePath: string;
  getId: (data: TData) => string;
}

const PayrollTableAction = <TData extends object>({
  row,
  basePath,
  getId,
}: PayrollTableActionProps<TData>) => {
  const router = useRouter();
  const id = getId(row.original);

  const handleAction = () => {
    if (basePath === "payroll/approvals") {
      router.push(`/dashboard/payroll/reports/summary/approvals/${id}`);
    }
  };

  return (
    <div className="flex justify-center">
      {basePath === "payroll/approvals" && (
        <div className="cursor-pointer flex justify-center items-center">
          <Button variant="link" onClick={() => handleAction()}>
            View
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayrollTableAction;
