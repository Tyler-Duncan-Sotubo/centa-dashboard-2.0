import { z } from "zod";

export const payFrequencySchema = z.object({
  payFrequency: z.enum(["weekly", "biweekly", "semi-monthly", "monthly"], {
    required_error: "Pay frequency is required",
  }),
  startDate: z.string({
    required_error: "Start date is required",
  }),
  weekendAdjustment: z.enum(["friday", "monday", "none"], {
    required_error: "Weekend adjustment is required",
  }),
  holidayAdjustment: z.enum(["previous", "next", "none"], {
    required_error: "Holiday adjustment is required",
  }),
});

export type PayFrequencyType = z.infer<typeof payFrequencySchema>;
