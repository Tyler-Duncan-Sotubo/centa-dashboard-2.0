"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShiftEvent } from "../types/shift-event.type";

export function useShiftLocations(
  data: Record<string, ShiftEvent[]> | undefined,
) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [shifts, setShifts] = useState<ShiftEvent[]>([]);

  useEffect(() => {
    if (!data) return;

    const locations = Object.keys(data);
    setLocationOptions(locations);

    if (!selectedLocation && locations.length > 0) {
      const first = locations[0];
      setSelectedLocation(first);
      setShifts(data[first] || []);
      return;
    }

    if (selectedLocation) setShifts(data[selectedLocation] || []);
  }, [data, selectedLocation]);

  const employees = useMemo(() => {
    return Array.from(
      new Map((shifts ?? []).map((s) => [s.employeeId, s])).values(),
    );
  }, [shifts]);

  return {
    selectedLocation,
    setSelectedLocation,
    locationOptions,
    shifts,
    setShifts,
    employees,
  };
}
