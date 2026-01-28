import { z } from "zod";

export const shiftModalSchema = z.object({
  shiftId: z.string().min(1, "Shift is required"),
});

export type ShiftModalSchema = z.infer<typeof shiftModalSchema>;
