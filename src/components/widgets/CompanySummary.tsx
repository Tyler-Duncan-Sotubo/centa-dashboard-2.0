import { ArrowDown, ArrowUp } from "lucide-react";
import { TbUsersPlus, TbUsersMinus, TbUsers } from "react-icons/tb";
import "react-calendar/dist/Calendar.css";
import { IconType } from "react-icons/lib";
import { SummaryData } from "@/app/dashboard/page";

export default function CompanySummary({
  data,
}: {
  data: SummaryData | undefined;
}) {
  const metricCard = (
    label: string,
    current: number | undefined,
    previous: number | undefined,
    color: string
  ) => {
    let TypeIcon: IconType | null = null;
    if (label === "Total Employees") TypeIcon = TbUsers;
    else if (label === "New Starters") TypeIcon = TbUsersPlus;
    else if (label === "Leavers") TypeIcon = TbUsersMinus;

    // check if its 0

    const delta = (current ?? 0) - (previous ?? 0);
    const isUp = delta >= 0;
    const isNeutral = delta === 0;
    const Icon = isUp ? ArrowUp : ArrowDown;

    const iconColor = isNeutral
      ? "text-gray-400"
      : isUp
      ? "text-green-500"
      : "text-red-500";
    const textColor = isNeutral
      ? "text-gray-500"
      : isUp
      ? "text-green-600"
      : "text-red-600";

    return (
      <div className="rounded-md bg-white shadow-md p-4 flex flex-col gap-2 border">
        <div className="flex items-center justify-between">
          <p className="text-md font-medium flex items-center gap-2">{label}</p>
          <span
            className={`text-2xl text-${color} bg-${color} bg-opacity-10 rounded-full p-4`}
          >
            {TypeIcon && <TypeIcon size={20} />}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center justify-between w-full">
            <div className="text-4xl font-bold">{current}</div>
          </div>
          <div className="flex items-center text-md font-semibold">
            {!isNeutral && <Icon size={18} className={iconColor} />}
            <p className={`mt-1 ${textColor}`}>
              {isNeutral ? "±0" : `${isUp ? "+" : "-"}${Math.abs(delta)}`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
          {metricCard(
            "Total Employees",
            data?.totalEmployees,
            data?.previousMonth.totalEmployees,
            "blue-500"
          )}
          {metricCard(
            "New Starters",
            data?.newStartersCount,
            data?.previousMonth.newStartersCount,
            "green-500"
          )}
          {metricCard(
            "Leavers",
            data?.leaversCount,
            data?.previousMonth.leaversCount,
            "red-500"
          )}
        </div>
      </div>
    </div>
  );
}
