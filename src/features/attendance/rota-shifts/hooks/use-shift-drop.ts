"use client";

import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/useAxiosAuth";
import type { ShiftEvent } from "../types/shift-event.type";

export function useShiftDrop() {
  const axiosAuth = useAxiosAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDrop = async (shift: ShiftEvent, newDate: Date) => {
    const newISO = format(newDate, "yyyy-MM-dd");
    if (newISO === shift.date) return;

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
      }
    } catch (error) {
      toast({
        title: "Failed to update shift",
        variant: "destructive",
      });
    }
  };

  return { handleDrop };
}
