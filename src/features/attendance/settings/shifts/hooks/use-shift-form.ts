"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Shift } from "@/types/shift.type";
import { shiftSchema, type ShiftFormValues } from "../schema/shift.schema";

export function useShiftForm(initialData?: Shift) {
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>(
    initialData?.workingDays || [],
  );

  const defaultValues: ShiftFormValues = useMemo(
    () =>
      initialData || {
        name: "",
        startTime: "",
        endTime: "",
        workingDays: [],
        locationId: "",
        lateToleranceMinutes: 10,
        allowEarlyClockIn: false,
        earlyClockInMinutes: 0,
        allowLateClockOut: false,
        lateClockOutMinutes: 0,
        notes: "",
      },
    [initialData],
  );

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues,
  });

  return { form, selectedWorkingDays, setSelectedWorkingDays };
}
