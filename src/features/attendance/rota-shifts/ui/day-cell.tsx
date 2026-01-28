"use client";

import { useCallback } from "react";
import { useDrop } from "react-dnd";
import { format, parseISO } from "date-fns";
import { FaPlus } from "react-icons/fa";
import type {
  ShiftEvent,
  CreateShiftEventPrefill,
} from "../types/shift-event.type";
import { ShiftCard } from "./shift-card";

export function DayCell({
  date,
  employee,
  shifts,
  onDropShift,
  onOpenShiftModal,
}: {
  date: Date;
  employee: ShiftEvent;
  shifts: ShiftEvent[];
  onDropShift: (shift: ShiftEvent, newDate: Date) => void;
  onOpenShiftModal: (prefill: CreateShiftEventPrefill) => void;
}) {
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
      canDrop: (item) => item.employeeId === employee.employeeId,
      drop: (item) => onDropShift(item, date),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, employee.employeeId, onDropShift],
  );

  const cellRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      drop(node);
    },
    [drop],
  );
  const isActive = isOver && canDrop;

  return (
    <td
      ref={cellRef}
      className={[
        "border w-32 h-16 align-center text-left bg-white px-1",
        isActive ? "bg-green-50" : "",
        isOver && !canDrop ? "bg-red-50 opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {cellShifts.length ? (
        cellShifts.map((shift) => (
          <div
            className="truncate"
            key={`${shift.employeeId}-${shift.date}-${shift.startTime}`}
          >
            <ShiftCard shift={shift} />
          </div>
        ))
      ) : (
        <div
          className="group h-full w-full rounded bg-[repeating-linear-gradient(45deg,#e5e7eb_0px,#e5e7eb_1px,transparent_1px,transparent_6px)] flex items-center justify-center min-w-28 cursor-pointer"
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
}
