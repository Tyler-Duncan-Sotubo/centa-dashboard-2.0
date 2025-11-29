import { formatDate } from "date-fns";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { CalendarDays, FileText, UserPlus } from "lucide-react";

const QuickActions = ({
  nextPayDate,
  totalEmployees,
}: {
  nextPayDate: string | null | undefined;
  totalEmployees: number | null | undefined;
}) => {
  return (
    <div className="flex flex-col space-y-1 gap-4 md:mt-0 mt-6 mx-auto">
      {/* Pay Date */}
      <section className="space-y-4">
        <section className="flex text-sm space-x-4">
          <div className="rounded-xl shadow-xs border border-background w-full p-2">
            <p className="text-textSecondary">Next Pay Day</p>
            <p className="font-semibold">
              {nextPayDate && !isNaN(new Date(nextPayDate).getTime())
                ? formatDate(new Date(nextPayDate), "dd MMMM yyyy")
                : "N/A"}
            </p>
          </div>
          <div className="rounded-xl shadow-xs border border-background w-full p-2">
            <p className="text-textSecondary">Status</p>
            <p className="font-semibold text-brand">Scheduled</p>
          </div>
        </section>

        <section className="flex text-sm space-x-4">
          <div className="rounded-xl shadow-xs border border-background w-full p-2">
            <p className="text-textSecondary">Total Employees</p>
            <p className="font-semibold ">{totalEmployees}</p>
          </div>
          <div className="rounded-xl shadow-xs border border-background w-full p-2">
            <p className="text-textSecondary">Tax File Date</p>
            <p className="font-semibold ">
              {nextPayDate && !isNaN(new Date(nextPayDate).getTime())
                ? formatDate(
                    new Date(
                      new Date(nextPayDate).setDate(
                        new Date(nextPayDate).getDate() + 10
                      )
                    ),
                    "dd MMMM yyyy"
                  )
                : "N/A"}
            </p>
          </div>
        </section>
      </section>

      {/* Quick Actions */}
      <section className="">
        <div>
          <p className="text-lg mb-2 font-bold">Quick Actions</p>
        </div>
        <div className="flex flex-col space-y-3">
          <Link href="/dashboard/payroll">
            <Button className="w-full">
              <CalendarDays className="mr-2" size={20} /> Run Payroll
            </Button>
          </Link>
          <Link href="/dashboard/taxes">
            <Button className="w-full" variant="outline">
              <FileText className="mr-2" size={20} />
              File Tax Returns
            </Button>
          </Link>
          <Link href="/dashboard/employees/invite">
            <Button className="w-full" variant="secondary">
              <UserPlus className="mr-2" size={20} /> Add New Employee
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default QuickActions;
