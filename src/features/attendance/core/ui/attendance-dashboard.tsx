import {
  AttendanceDetails,
  AttendanceMetrics,
} from "@/features/attendance/core/types/attendance.type";
import {
  FaCheckCircle,
  FaUserClock,
  FaClock,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { LuClockArrowDown } from "react-icons/lu";

type AttendanceDashboardProps = {
  details: AttendanceDetails | undefined;
  metrics: AttendanceMetrics | undefined;
};

export default function AttendanceDashboard({
  details,
  metrics,
}: AttendanceDashboardProps) {
  const attendanceChange = metrics?.attendanceChangePercent ?? 0;
  const lateChange = metrics?.lateChangePercent ?? 0;
  const absentChange = Number(metrics?.absentChange ?? 0);

  const metricsData = [
    {
      title: "Employees Present",
      titleIcon: <FaCheckCircle />,
      value: (details?.present ?? 0) + (details?.late ?? 0),
      change: attendanceChange,
      changeLabel: `${Math.abs(attendanceChange)}% ${
        attendanceChange > 0
          ? "more than yesterday"
          : attendanceChange < 0
            ? "less than yesterday"
            : "no change"
      }`,
      isPositive: attendanceChange > 0,
    },
    {
      title: "Late Arrivals Today",
      titleIcon: <LuClockArrowDown />,
      value: details?.late ?? 0,
      change: lateChange,
      changeLabel: `${Math.abs(lateChange)}% ${
        lateChange > 0
          ? "more than yesterday"
          : lateChange < 0
            ? "less than yesterday"
            : "no change"
      }`,
      isPositive: lateChange < 0,
    },
    {
      title: "Employees Absent",
      titleIcon: <FaUserClock />,
      value: details?.absent ?? 0,
      change: absentChange,
      changeLabel: `${Math.abs(absentChange)}% ${
        absentChange < 0
          ? "better than yesterday"
          : absentChange > 0
            ? "worse than yesterday"
            : "no change"
      }`,
      isPositive: absentChange < 0,
    },
    {
      title: "Attendance Rate",
      titleIcon: <FaClock />,
      value: (() => {
        const raw = details?.attendanceRate;
        if (!raw) return "0%";
        const n = Number(String(raw).replace("%", ""));
        return n > 0 ? `${n}%` : "0%";
      })(),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-10">
      {metricsData.map(
        ({ title, titleIcon, value, change, changeLabel, isPositive }) => (
          <div
            key={title}
            className="px-4 py-6 space-y-3 shadow-lg rounded-lg bg-white"
          >
            <div className="text-base text-textPrimary font-semibold flex items-center gap-2">
              <p className="text-base text-brand">{titleIcon}</p>
              <p>{title}</p>
            </div>

            <div className="flex flex-col gap-1 space-y-2">
              <div className="text-3xl font-semibold">{value}</div>

              {typeof change !== "undefined" && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    isPositive
                      ? "text-green-600"
                      : change === 0
                        ? "text-gray-500"
                        : "text-red-600"
                  }`}
                >
                  {change > 0 && <FaArrowUp className="w-4 h-4 mr-1" />}
                  {change < 0 && <FaArrowDown className="w-4 h-4 mr-1" />}
                  <span>{changeLabel}</span>
                </div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
