"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  parseISO,
} from "date-fns";
import { Button } from "@/shared/ui/button"; // ShadCN button
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarIcon,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui/tooltip";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { Holiday, Leave } from "@/features/leave/types/leave.type";
import { FaListUl } from "react-icons/fa";
import { LeaveRequest } from "@/features/leave/types/leave.type";

type Props = {
  leaves: Leave[] | undefined;
  holidays: Holiday[] | undefined;
};

const CustomCalendar = ({ leaves, holidays }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showAll, setShowAll] = useState(false);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Helpers
  const isDateInLeaveRange = (date: Date) => {
    const isWeekend = getDay(date) === 0 || getDay(date) === 6;
    if (isWeekend) return []; // Don't show leave on weekends

    return leaves?.filter((leave) => {
      if (leave.status !== "approved") return false;
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      return date >= start && date <= end;
    });
  };

  const getHolidayOnDate = (date: Date) => {
    return holidays?.find((holiday) => {
      const holidayDate = parseISO(holiday.date);
      return holidayDate.toDateString() === date.toDateString();
    });
  };

  // Render each calendar day
  const renderDays = () => {
    const startDay = getDay(firstDayOfMonth);
    const totalCells = Math.ceil((daysInMonth.length + startDay) / 7) * 7;

    return Array.from({ length: totalCells }).map((_, index) => {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() + (index - startDay));

      const isWeekend = getDay(date) === 0 || getDay(date) === 6;
      const leaveEvents = isDateInLeaveRange(date);
      const holiday = getHolidayOnDate(date);
      const isCurrentMonth = isSameMonth(date, currentDate);
      const isTodayDay = isToday(date);

      // Build leave display
      const leaveDisplay = leaveEvents?.map((leave) => {
        const start = parseISO(leave.startDate);
        const end = parseISO(leave.endDate);
        return {
          id: leave.requestId,
          title: leave.leaveType,
          employee: leave.employeeName,
          range: `from ${format(start, "d")} – ${format(end, "d")}`,
        };
      });

      // Determine base background
      let baseBg = "bg-white";
      if (isTodayDay) baseBg = "bg-brand";
      else if (isWeekend) baseBg = "bg-gray-50";

      const getLeaveEmoji = (type: string): string => {
        const t = type.toLowerCase();

        if (t.includes("sick")) return "🤒";
        if (t.includes("vacation") || t.includes("annual")) return "🏖️";
        if (t.includes("maternity")) return "👶";
        if (t.includes("training")) return "🎓";
        if (t.includes("conference")) return "🗣️";
        if (t.includes("personal")) return "🧘";
        if (t.includes("unpaid")) return "💸";
        if (t.includes("sabbatical")) return "🌍";

        return "📝"; // default/fallback
      };

      return (
        <div
          key={index}
          className={`p-2 text-sm border h-35 flex flex-col justify-between border-gray-100 ${
            !isCurrentMonth ? "opacity-50" : ""
          }${baseBg}`}
        >
          {/* Top-left: Date number (always shown) */}
          <div className="font-semibold text-left">{format(date, "d")}</div>

          {/* Bottom: Stack leave + holiday items */}
          <div className="flex flex-col gap-1 text-xs text-textPrimary">
            {/* Leave Events */}
            {leaveDisplay?.map((leave) => (
              <Tooltip key={`leave-${leave.id}`}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer truncate">
                    <div className="text-lg"> {getLeaveEmoji(leave.title)}</div>
                    <span className="truncate">{leave.title}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>{leave.employee}</strong>
                    <br />
                    {leave.title}
                    <br />
                    {leave.range}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Holiday */}
            {holiday && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer truncate">
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                    <span className="truncate">{holiday.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>{holiday.name}</strong>
                    <br />
                    Type: {holiday.type}
                    <br />
                    Date: {format(parseISO(holiday.date), "PPP")}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      );
    });
  };

  const renderListView = () => {
    const totalDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

    // Group leaves by employee
    const employeeLeavesMap: Record<string, LeaveRequest[]> = {};
    leaves?.forEach((leave) => {
      if (!employeeLeavesMap[leave.employeeName]) {
        employeeLeavesMap[leave.employeeName] = [];
      }
      employeeLeavesMap[leave.employeeName].push(leave);
    });

    const allEmployees = Object.entries(employeeLeavesMap);

    const displayedEmployees = showAll
      ? allEmployees
      : allEmployees.slice(0, 17);

    const getLeaveEmoji = (type: string): string => {
      const t = type.toLowerCase();

      if (t.includes("sick")) return "🤒";
      if (t.includes("vacation") || t.includes("annual")) return "🏖️";
      if (t.includes("maternity")) return "👶";
      if (t.includes("training")) return "🎓";
      if (t.includes("conference")) return "🗣️";
      if (t.includes("personal")) return "🧘";
      if (t.includes("unpaid")) return "💸";
      if (t.includes("sabbatical")) return "🌍";

      return "📝"; // default/fallback
    };

    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full table-fixed border border-gray-300">
          <thead>
            <tr>
              <th className="border p-3 text-left w-96 bg-gray-100">
                Employee
              </th>
              {daysArray.map((day) => (
                <th
                  key={day}
                  className="border shadow-md rounded-md p-6 text-center bg-gray-50"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map(([employee, leaves]) => (
              <tr key={employee} className="text-sm">
                <td className="border-4 border-sidebar p-3 min-w-40 font-medium sticky left-0 z-10 bg-opacity-90 ">
                  {employee}
                </td>
                {daysArray.map((day) => {
                  const cellDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day,
                  );

                  const leave = leaves.find((leave) => {
                    const start = parseISO(leave.startDate);
                    const end = parseISO(leave.endDate);
                    return cellDate >= start && cellDate <= end;
                  });

                  return (
                    <td
                      key={day}
                      className="m-2 w-16 h-14 rounded-xl shadow-xl bg-white p-0 border-4 border-sidebar transition-all hover:shadow-2xl hover:ring-1 hover:ring-gray-300"
                    >
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {leave ? getLeaveEmoji(leave.leaveType) : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Toggle Button */}
        {allEmployees.length > 17 && (
          <div className="mt-4 text-center">
            <button
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all ({allEmployees.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white mt-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              size={"icon"}
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon size={20} />
            </Button>
            <Button
              size={"icon"}
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              <FaListUl size={20} />
            </Button>
            <Button onClick={handlePrevMonth} size={"icon"}>
              <ArrowLeft />
            </Button>
            <Button onClick={handleNextMonth} size={"icon"}>
              <ArrowRight />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end my-6"></div>

        {/* Weekdays */}

        {viewMode === "calendar" ? (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-gray-600 font-medium mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <TooltipProvider>
              <div className="grid grid-cols-7">{renderDays()}</div>
            </TooltipProvider>
          </>
        ) : (
          renderListView()
        )}
      </div>
    </div>
  );
};

export default CustomCalendar;
