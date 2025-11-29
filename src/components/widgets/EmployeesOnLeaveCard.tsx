"use client";

import { format } from "date-fns";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatars } from "../avatars";

export function EmployeesOnLeaveCard({
  data,
}: {
  data?:
    | {
        name: string;
        startDate: Date;
        endDate: Date;
        leaveType: string;
      }[]
    | undefined;
}) {
  return (
    <section className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-sm border mb-10">
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-semibold">Employees on Leave</p>
        <Link href="/dashboard/leave">
          <Button variant={"outline"} size={"sm"}>
            View all
          </Button>
        </Link>
      </div>
      <section className="space-y-4">
        {data?.map((leave, idx) => (
          <div key={idx} className="flex  space-x-2 text-sm">
            <div>{Avatars({ name: leave.name })}</div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {leave.name}
              </div>
              <div className="flex items-center gap-2 font-medium">
                {format(leave.startDate, "PPP")} -{" "}
                {format(leave.endDate, "PPP")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {leave.leaveType}
              </div>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
