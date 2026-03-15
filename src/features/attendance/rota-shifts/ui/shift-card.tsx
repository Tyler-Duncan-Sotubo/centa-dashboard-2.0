"use client";

import { useCallback } from "react";
import { useDrag } from "react-dnd";
import { format, parseISO } from "date-fns";
import { GripVertical, Trash2 } from "lucide-react";
import { useDeleteMutation } from "@/shared/hooks/useDeleteMutation";
import { getShiftBorderClass } from "../config/shift-colors";
import type { ShiftEvent } from "../types/shift-event.type";

export function ShiftCard({ shift }: { shift: ShiftEvent }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "SHIFT",
      item: shift,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [shift],
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
    [drag],
  );

  const start = format(parseISO(`${shift.date}T${shift.startTime}`), "ha");
  const end = format(parseISO(`${shift.date}T${shift.endTime}`), "ha");

  return (
    <div
      ref={dragRef}
      className={[
        "group px-1 py-0.5 cursor-move text-xs flex items-start gap-1 border-l-[3px]",
        getShiftBorderClass(shift.shiftName),
        isDragging ? "opacity-50" : "",
      ].join(" ")}
    >
      <GripVertical className="w-3 h-4 mt-0.5 text-muted-foreground shrink-0" />

      <div className="flex flex-col min-w-0">
        <p className="font-bold text-xs lowercase leading-tight">
          {start} – {end}
        </p>
        <p className="text-[8px] text-muted-foreground capitalize">
          {shift.jobTitle?.substring(0, 20)}
          {(shift.jobTitle?.length ?? 0) > 20 ? "…" : ""}
        </p>
      </div>

      <button
        onClick={() => deleteShift()}
        aria-label="Delete shift"
        className="hidden opacity-0 group-hover:opacity-100 group-hover:block transition-opacity cursor-pointer"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}
