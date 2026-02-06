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
  // Define metrics data
  const metricsData = [
    {
      title: "Employees Present",
      titleIcon: <FaCheckCircle />,
      value: (details?.present ?? 0) + (details?.late ?? 0),
      change: metrics?.attendanceChangePercent ?? 0,
      changeLabel: `${Math.abs(metrics?.attendanceChangePercent ?? 0)}% ${
        (metrics?.attendanceChangePercent ?? 0 > 0)
          ? "more than yesterday"
          : (metrics?.attendanceChangePercent ?? 0 < 0)
            ? "less than yesterday"
            : "no change"
      }`,
      isPositive: metrics?.attendanceChangePercent ?? 0 > 0,
    },
    {
      title: "Late Arrivals Today",
      titleIcon: <LuClockArrowDown />,
      value: details?.late ?? 0,
      change: metrics?.lateChangePercent ?? 0,
      changeLabel: `${Math.abs(metrics?.lateChangePercent ?? 0)}% ${
        (metrics?.lateChangePercent ?? 0 > 0)
          ? "more than yesterday"
          : (metrics?.lateChangePercent ?? 0 < 0)
            ? "less than yesterday"
            : "no change"
      }`,
      isPositive: metrics?.lateChangePercent ?? 0 <= 0,
    },
    {
      title: "Employees Absent",
      titleIcon: <FaUserClock />,
      value: details?.absent ?? 0,
      change: parseFloat(metrics?.absentChange ?? "0"),
      changeLabel: `${Math.abs(parseFloat(metrics?.absentChange ?? "0"))}% ${
        parseFloat(metrics?.absentChange ?? "0") < 0
          ? "better than yesterday"
          : parseFloat(metrics?.absentChange ?? "0") > 0
            ? "worse than yesterday"
            : "no change"
      }`,
      isPositive: parseFloat(metrics?.absentChange ?? "0") < 0,
    },
    {
      title: "Attendance Rate",
      titleIcon: <FaClock />,
      value: (() => {
        const raw = details?.attendanceRate;
        if (!raw) return "0%";

        // extract numeric part safely
        const n = Number(String(raw).replace("%", ""));
        return n > 0 ? `${n}%` : "0%";
      })(),
    },
  ];

  // Render UI based on metrics data
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-10">
      {metricsData.map(
        ({ title, titleIcon, value, change, changeLabel, isPositive }) => (
          <div
            key={title}
            className="px-4 py-6 space-y-3 shadow-lg rounded-lg bg-white"
          >
            <div>
              <div className="text-base text-textPrimary font-semibold flex items-center gap-2">
                <p className="text-base text-brand">{titleIcon}</p>
                <p>{title}</p>
              </div>
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
                  {change === 0 && null}
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
