"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import EmptyState from "@/shared/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useSession } from "next-auth/react";
import type { CreateShiftEventPrefill } from "../types/shift-event.type";
import { useShiftCalendarWeek } from "../hooks/use-shift-calendar-week";
import { useShiftEventsQuery } from "../hooks/use-shift-events-query";
import { useShiftLocations } from "../hooks/use-shift-locations";
import { useShiftDrop } from "../hooks/use-shift-drop";
import { DayCell } from "./day-cell";
import { ShiftModal } from "./shift-modal";

export function ShiftCalendar() {
  const { status } = useSession();
  const {
    weekStart,
    weekEnd,
    days,
    startStr,
    endStr,
    handlePrevWeek,
    handleNextWeek,
  } = useShiftCalendarWeek();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState<CreateShiftEventPrefill>();

  const {
    selectedLocation,
    setSelectedLocation,
    locationOptions,
    shifts,
    employees,
  } = useShiftLocations(undefined);

  const { data, isLoading } = useShiftEventsQuery({
    startStr,
    endStr,
    selectedLocation,
  });

  // re-bind locations when data arrives
  const locationState = useShiftLocations(data as any);

  const { handleDrop } = useShiftDrop();

  if (status === "loading" || isLoading) return <Loading />;

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          title="No Shifts Found"
          description="Please Add Employees to start managing shifts."
          image="https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757585357/shifts_dmkkyc.svg"
          actionLabel="Invite Employees"
          actionHref="/dashboard/employees/invite"
        />
      </div>
    );
  }

  const onOpenShiftModal = (prefill: CreateShiftEventPrefill) => {
    setModalPrefill(prefill);
    setIsModalOpen(true);
  };

  const avatarDisplay = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return (
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-monzo-background text-white font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <p className="capitalize text-sm font-semibold">{name}</p>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="py-4">
        <div className="flex justify-end items-center mb-4 space-x-3">
          <Select
            value={locationState.selectedLocation}
            onValueChange={(loc) => {
              locationState.setSelectedLocation(loc);
              locationState.setShifts((data as any)?.[loc] || []);
            }}
          >
            <SelectTrigger className="w-48 border rounded bg-white text-sm mb-4">
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              {locationState.locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 mb-4">
            <Button size="icon" onClick={handlePrevWeek}>
              <ArrowLeft />
            </Button>
            <span>
              {format(weekStart, "d MMM")} – {format(weekEnd, "d MMM yyyy")}
            </span>
            <Button size="icon" onClick={handleNextWeek}>
              <ArrowRight />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-fixed min-w-full border">
            <thead>
              <tr>
                <th className="w-40 border p-2 text-left bg-gray-50">
                  Employee
                </th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className="border text-left p-2 bg-gray-50"
                  >
                    {format(day, "EEE d")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locationState.employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="border p-2 font-medium sticky left-0 bg-white z-10 min-w-40">
                    {avatarDisplay(emp.employeeName)}
                  </td>

                  {days.map((day) => (
                    <DayCell
                      key={`${emp.employeeId}-${day.toISOString()}`}
                      date={day}
                      employee={emp}
                      shifts={locationState.shifts}
                      onDropShift={handleDrop}
                      onOpenShiftModal={onOpenShiftModal}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ShiftModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={modalPrefill}
        />
      </div>
    </DndProvider>
  );
}
