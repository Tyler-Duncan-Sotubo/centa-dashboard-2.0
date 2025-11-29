"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  format,
  addDays,
  subDays,
  eachDayOfInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GripVertical } from "lucide-react"; // Add this import
import ShiftModal from "./ShiftModal";
import Loading from "@/components/ui/loading";
import { isAxiosError } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPlus } from "react-icons/fa";
import { useDeleteMutation } from "@/hooks/useDeleteMutation";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import EmptyState from "@/components/empty-state";

// Color map
const shiftColorMap: Record<string, string> = {
  "Morning Shift": "green-500",
  "Evening Shift": "yellow-500",
  "Night Shift": "purple-500",
  default: "blue-500",
};

const getShiftColor = (name: string) =>
  shiftColorMap[name] || shiftColorMap.default;

// --- Shift types
type ShiftEvent = {
  id: string;
  employeeName: string;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  jobTitle?: string;
  employeeId: string;
  locationId: string;
  shiftId: string;
};

type createShiftEvent = {
  employeeId: string;
  date: string;
  shiftId: string;
  employeeName: string;
  locationId: string;
};

const ShiftCard = ({ shift }: { shift: ShiftEvent }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "SHIFT",
      item: shift,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [shift]
  );

  const deleteShift = useDeleteMutation({
    endpoint: `/api/employee-shifts/${shift.id}`,
    successMessage: "Shift deleted successfully",
    refetchKey: "employee-shifts",
  });

  const dragRef = useCallback(
    (el: HTMLDivElement | null) => {
      drag(el);
    },
    [drag]
  );

  const start = format(parseISO(`${shift.date}T${shift.startTime}`), "ha");
  const end = format(parseISO(`${shift.date}T${shift.endTime}`), "ha");

  return (
    <div
      ref={dragRef}
      className={`group px-1 py-0.5 cursor-move text-xs flex items-start gap-1 border-l-[3px] border-${getShiftColor(
        shift.shiftName
      )} ${isDragging ? "opacity-50" : ""}`}
    >
      <GripVertical className="w-3 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex flex-col">
        <p className="font-bold text-sm lowercase leading-tight">
          {start} – {end}
        </p>
        <p className="text-[10px] text-muted-foreground capitalize truncate">
          {shift.jobTitle}
        </p>
      </div>
      <button
        onClick={() => {
          deleteShift();
        }}
        aria-label="Delete shift"
        className="hidden opacity-0 group-hover:opacity-100 group-hover:block transition-opacity "
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
};

const DayCell = ({
  date,
  employee,
  shifts,
  onDropShift,
  onOpenShiftModal,
}: {
  date: Date;
  employee: ShiftEvent;
  shifts: ShiftEvent[];
  onDropShift: (shift: ShiftEvent, newDate: Date, employee: string) => void;
  onOpenShiftModal: (prefill: createShiftEvent) => void;
}) => {
  const cellShifts = shifts.filter((s) => {
    if (!s.date || isNaN(Date.parse(s.date))) return false;

    return (
      s.employeeName === employee.employeeName &&
      format(parseISO(s.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  });

  const [{ isOver, canDrop }, drop] = useDrop<
    ShiftEvent,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: "SHIFT",
      // only allow drops for this same employee:
      canDrop: (item) => item.employeeId === employee.employeeId,
      drop: (item) => onDropShift(item, date, employee.employeeName),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, employee.employeeId, onDropShift]
  );

  const isActive = isOver && canDrop;

  const cellRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      drop(node);
    },
    [drop]
  );

  return (
    <td
      ref={cellRef}
      className={`
        border w-32 h-16 align-center text-left bg-white px-1
        ${isActive ? "bg-green-50" : ""}
        ${isOver && !canDrop ? "bg-red-50 opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {cellShifts.length > 0 ? (
        cellShifts.map((shift) => {
          const key = `${shift.employeeId}-${shift.date}-${shift.startTime}`;
          return (
            <div className="truncate" key={key}>
              <ShiftCard shift={shift} />
            </div>
          );
        })
      ) : (
        <div
          className="group h-full w-full rounded bg-[repeating-linear-gradient(45deg,_#e5e7eb_0px,_#e5e7eb_1px,_transparent_1px,_transparent_6px)] flex items-center justify-center min-w-28 cursor-pointer"
          onClick={() =>
            onOpenShiftModal({
              employeeId: employee.employeeId,
              date: format(date, "yyyy-MM-dd"),
              shiftId: "",
              employeeName: employee.employeeName,
              locationId: employee.locationId,
            })
          }
        >
          <p className="text-sm text-gray-500 hidden opacity-0 group-hover:opacity-100 group-hover:block">
            <FaPlus className="w-4 h-4 text-gray-500" />
          </p>
        </div>
      )}
    </td>
  );
};

// --- Main Calendar
const ShiftCalendar = () => {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const axiosAuth = useAxiosAuth();
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [shifts, setShifts] = useState<ShiftEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState<createShiftEvent>();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(weekEnd, "yyyy-MM-dd");

  const fetchShiftEvents = async () => {
    try {
      const res = await axiosAuth.get(
        `/api/employee-shifts/events/calendar?start=${startStr}&end=${endStr}`
      );
      return res.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) return [];
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["employee-shifts", selectedLocation, startStr],
    queryFn: fetchShiftEvents,
    enabled: !!session?.backendTokens.accessToken,
  });

  useEffect(() => {
    if (!data) return;
    const locations = Object.keys(data);
    setLocationOptions(locations);

    if (!selectedLocation && locations.length > 0) {
      setSelectedLocation(locations[0]);
      setShifts(data[locations[0]]);
    } else if (selectedLocation) {
      // on every refetch: refresh the shifts array for the existing branch
      setShifts(data[selectedLocation] || []);
    }
  }, [data, selectedLocation]);

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

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevWeek = () => setWeekStart((d) => subDays(d, 7));
  const handleNextWeek = () => setWeekStart((d) => addDays(d, 7));

  const handleDrop = async (shift: ShiftEvent, newDate: Date) => {
    const newISO = format(newDate, "yyyy-MM-dd");

    // Check if the new date is the same as the old date
    if (newISO === shift.date) return;

    // Call the API to update the shift
    try {
      const res = await axiosAuth.patch(`/api/employee-shifts/${shift.id}`, {
        shiftDate: newISO,
        shiftId: shift.shiftId,
      });

      if (res.status === 200) {
        toast({
          title: "Shift updated",
          description: "The shift has been successfully updated.",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
      } else {
        console.error("Failed to update shift:", res.data);
      }
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  const onOpenShiftModal = (prefill: createShiftEvent) => {
    setModalPrefill(prefill);
    setIsModalOpen(true);
  };

  const AvatarDisplay = (name: string) => {
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
        <div>
          <p className="capitalize text-sm font-semibold">{name}</p>
        </div>
      </div>
    );
  };

  const employees = Array.from(
    new Map(shifts.map((s) => [s.employeeId, s])).values()
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="py-4">
        <div className="flex justify-end items-center mb-4 space-x-3">
          <div>
            <div>
              <Select
                value={selectedLocation}
                onValueChange={(loc) => {
                  setSelectedLocation(loc);
                  setShifts(data?.[loc] || []);
                }}
              >
                <SelectTrigger className="w-48 border rounded bg-white text-sm mb-4">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="border p-2 font-medium sticky left-0 bg-white z-10 min-w-[10rem]">
                    {AvatarDisplay(emp.employeeName)}
                  </td>
                  {days.map((day) => (
                    <DayCell
                      key={`${emp.employeeId}-${day.toISOString()}`}
                      date={day}
                      employee={emp}
                      shifts={shifts}
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
};

export default ShiftCalendar;
