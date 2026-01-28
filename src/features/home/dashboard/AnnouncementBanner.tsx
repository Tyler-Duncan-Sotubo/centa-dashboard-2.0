"use client";

import { differenceInCalendarDays } from "date-fns";

export default function AnnouncementBanner({
  nextPayDate,
}: {
  nextPayDate: string | null | undefined;
}) {
  if (!nextPayDate || isNaN(new Date(nextPayDate).getTime())) return null;

  const today = new Date();
  const payDate = new Date(nextPayDate);
  const daysLeft = differenceInCalendarDays(payDate, today);

  // if (daysLeft > 10 || daysLeft < 0) return null;

  return (
    <div className="bg-monzo-background border-l-4 border-monzo-monzoGreen text-monzo-textPrimary p-4 rounded-md my-4">
      <p className="text-sm">
        📣 Your next pay date is in{" "}
        <span className="font-bold text-monzo-monzoGreen">
          {daysLeft} Day{daysLeft !== 1 ? "s" : ""}.
        </span>{" "}
        Make sure payroll is processed on time.
      </p>
    </div>
  );
}
