"use client";

import { useState } from "react";

export function useTimesheetDate() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return { date, setDate, open, setOpen };
}
