import { z } from "zod";

export const shiftDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string(),
  workingDays: z.array(z.string()),
  lateToleranceMinutes: z.coerce.number().optional(),
  allowEarlyClockIn: z.boolean().optional(),
  earlyClockInMinutes: z.coerce.number().optional(),
  allowLateClockOut: z.boolean().optional(),
  lateClockOutMinutes: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
